export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

// Note: In a real Next.js app, file parsing often needs to handle FormData carefully.
// We'll use a standard approach for App Router API routes.

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('resume') as File;

        if (!file) {
            return NextResponse.json({ error: 'No resume provided' }, { status: 400 });
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse-new');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const XLSX = require('xlsx');

        let text = "";
        const mimeType = file.type;
        let candidatesData: any[] = [];

        console.log(`[PARSE-RESUME] File info - Name: "${file.name}", MIME: "${mimeType}", Size: ${buffer.length} bytes`);

        try {
            if (mimeType === 'application/pdf') {
                console.log('[PARSE-RESUME] Taking PDF path');
                const data = await pdfParse(buffer);
                text = data.text;
                // PDF text will be sent to AI for bulk extraction
            } else if (
                mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                mimeType === 'application/vnd.ms-excel' ||
                file.name.endsWith('.xlsx') ||
                file.name.endsWith('.xls')
            ) {
                console.log('[PARSE-RESUME] Detected Excel file, starting parse...');
                const workbook = XLSX.read(buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                console.log(`[PARSE-RESUME] Reading sheet: ${sheetName}`);
                // Convert to JSON directly to handle bulk rows
                const rawData = XLSX.utils.sheet_to_json(worksheet);
                console.log(`[PARSE-RESUME] Raw data rows: ${rawData.length}`);

                if (Array.isArray(rawData) && rawData.length > 0) {
                    // SMART COLUMN DETECTION - handles missing/mangled headers
                    candidatesData = rawData.map((row: any) => {
                        const values = Object.values(row);
                        const keys = Object.keys(row);

                        // --- HEBREW/YIDDISH FRIENDLY DETECTION ---
                        // Detect Email (look for @ symbol or header variants in EN/HE/YI)
                        let email = '';
                        const emailKey = keys.find(k =>
                            /email|mail|e-mail|מייל|אימייל|דוא["']?ל/.test(k.toLowerCase())
                        );
                        if (emailKey) {
                            email = String(row[emailKey]).trim();
                        } else {
                            // Scan values for anything with @
                            const emailVal = values.find((v: any) => String(v).includes('@') && String(v).length < 100);
                            if (emailVal) email = String(emailVal).trim();
                        }

                        // Detect Phone (look for numeric patterns)
                        let phone = '';
                        const phoneKey = keys.find(k =>
                            /phone|mobile|tel|טלפון|פלאפון|נייד|סלולרי|טעלעפון/.test(k.toLowerCase())
                        );
                        if (phoneKey) {
                            phone = String(row[phoneKey]).trim();
                        } else {
                            // Scan for numeric-ish values (9-15 digits)
                            const phoneVal = values.find((v: any) => {
                                const s = String(v).replace(/[^0-9]/g, '');
                                return s.length >= 9 && s.length <= 15;
                            });
                            if (phoneVal) phone = String(phoneVal).trim();
                        }

                        // Detect Name (prefer column near phone, skip long descriptions)
                        let name = '';
                        const nameKey = keys.find(k =>
                            /name|candidate|שם\s*מלא|שם המועמד|שם|שם פרטי|שם משפחה|נאמען/.test(k.toLowerCase())
                        );
                        if (nameKey) {
                            name = String(row[nameKey]).trim();
                        } else {
                            // Find text column near phone (name usually comes before/after phone)
                            const potentialNames = values.map((v: any, idx: number) => ({ v, idx }))
                                .filter(({ v }) =>
                                    typeof v === 'string' &&
                                    !v.includes('@') &&
                                    v.length > 2 &&
                                    v.length < 60 &&  // Names are typically shorter
                                    !/[0-9]/.test(v) && // Exclude anything with digits (e.g. "100 לשעה")
                                    !/^[0-9\-\s\(\)\.+]{6,}$/.test(v) && // Not a phone
                                    !v.includes(',') && !v.includes('.') // Skip descriptions with punctuation
                                );

                            // Prefer columns close to phone/email columns
                            if (potentialNames.length > 1) {
                                name = String(potentialNames[potentialNames.length - 1].v).trim(); // Take last candidate (usually name)
                            } else if (potentialNames.length === 1) {
                                name = String(potentialNames[0].v).trim();
                            }
                        }

                        // Skills detection (optional, look for comma-separated lists)
                        let skills: any[] = [];
                        const skillsKey = keys.find(k => /skill|מיומנות|התמחות/.test(k.toLowerCase()));
                        if (skillsKey && row[skillsKey]) {
                            skills = String(row[skillsKey]).split(/[,;]/).map((s: string) => ({ name: s.trim(), status: 'unverified' })).filter((s: any) => s.name);
                        }

                        // Detect Score
                        let score = undefined;
                        const scoreKey = keys.find(k => /score|rating|ציון|דירוג/.test(k.toLowerCase()));
                        if (scoreKey) {
                            score = Number(row[scoreKey]);
                        }

                        // Detect Priority
                        let priority = 'medium';
                        const priorityKey = keys.find(k => /priority|עדיפות/.test(k.toLowerCase()));
                        if (priorityKey) {
                            const p = String(row[priorityKey]).toLowerCase();
                            if (p.includes('high') || p.includes('גבוה')) priority = 'high';
                            else if (p.includes('low') || p.includes('נמוך')) priority = 'low';
                        }

                        // Detect Status
                        let status = 'new';
                        const statusKey = keys.find(k => /status|state|סטטוס|מצב|שלב/.test(k.toLowerCase()));
                        if (statusKey) {
                            const s = String(row[statusKey]).toLowerCase();
                            if (s.includes('review') || s.includes('screening') || s.includes('סינון') || s.includes('מיון')) status = 'screening';
                            else if (s.includes('interview') || s.includes('ראיון')) status = 'interview';
                            else if (s.includes('offer') || s.includes('הצעה')) status = 'offer';
                            else if (s.includes('hired') || s.includes('גוייס') || s.includes('התקבל')) status = 'hired';
                            else if (s.includes('reject') || s.includes('דחייה') || s.includes('לא מתאים')) status = 'rejected';
                        }

                        // Detect Notes
                        let notes = '';
                        const notesKey = keys.find(k => /note|comment|הערות|משוב/.test(k.toLowerCase()));
                        if (notesKey) {
                            notes = String(row[notesKey]).trim();
                        }

                        return {
                            full_name: name || email.split('@')[0] || 'Unknown',
                            email: email || '',
                            phone: phone || '',
                            skills: skills,
                            summary: 'Bulk Import',
                            experience_years: 0,
                            source: 'Import',
                            status: status as any,
                            priority: priority as any,
                            score: isNaN(score as any) ? undefined : score,
                            notes: notes
                        };
                    }).filter(c => c.email || c.phone); // Keep only if has contact info

                    console.log(`[PARSE-RESUME] Parsed ${candidatesData.length} candidates from Excel`);
                }
            } else {
                // Try parsing as CSV/TSV (tab or comma separated)
                console.log('[PARSE-RESUME] Taking CSV/TSV path');
                const text = buffer.toString('utf-8');
                const lines = text.split('\n').filter(line => line.trim());

                if (lines.length > 1) {
                    // Detect delimiter (tab or comma)
                    const firstLine = lines[0];
                    const delimiter = firstLine.includes('\t') ? '\t' : ',';
                    console.log(`[PARSE-RESUME] Detected delimiter: ${delimiter === '\t' ? 'TAB' : 'COMMA'}, ${lines.length} lines`);

                    // Parse headers to find column indices (EN/HE/YI friendly)
                    const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase());
                    const emailCol = headers.findIndex(h =>
                        /email|mail|e-mail|מייל|אימייל|דוא["']?ל/.test(h) || h.includes('@')
                    );
                    const phoneCol = headers.findIndex(h =>
                        /phone|mobile|tel|טלפון|פלאפון|נייד|סלולרי|טעלעפון/.test(h)
                    );
                    const nameCol = headers.findIndex(h =>
                        /name|candidate|שם\s*מלא|שם המועמד|שם|שם פרטי|שם משפחה|נאמען/.test(h)
                    );
                    const scoreCol = headers.findIndex(h => /score|rating|ציון|דירוג/.test(h));
                    const priorityCol = headers.findIndex(h => /priority|עדיפות/.test(h));
                    const statusCol = headers.findIndex(h => /status|state|סטטוס|מצב|שלב/.test(h));
                    const notesCol = headers.findIndex(h => /note|comment|הערות|משוב/.test(h));

                    console.log(`[PARSE-RESUME] Column mapping - Email: ${emailCol}, Phone: ${phoneCol}, Name: ${nameCol}, Score: ${scoreCol}`);

                    // Skip header row and parse data rows
                    const dataLines = lines.slice(1);
                    candidatesData = dataLines.map((line: string) => {
                        const values = line.split(delimiter).map(v => v.trim());

                        // Use column indices if found, otherwise scan
                        let email = emailCol >= 0 ? values[emailCol] : '';
                        let phone = phoneCol >= 0 ? values[phoneCol] : '';
                        let name = nameCol >= 0 ? values[nameCol] : '';
                        let score = scoreCol >= 0 ? parseInt(values[scoreCol]) : undefined;
                        let priority = 'medium';
                        let status = 'new';
                        let notes = notesCol >= 0 ? values[notesCol] : '';

                        if (priorityCol >= 0) {
                            const p = values[priorityCol].toLowerCase();
                            if (p.includes('high')) priority = 'high';
                            else if (p.includes('low')) priority = 'low';
                        }

                        if (statusCol >= 0) {
                            const s = values[statusCol].toLowerCase();
                            if (s.includes('review') || s.includes('screening')) status = 'screening';
                            else if (s.includes('interview')) status = 'interview';
                            else if (s.includes('offer')) status = 'offer';
                            else if (s.includes('hired')) status = 'hired';
                            else if (s.includes('reject')) status = 'rejected';
                        }

                        // Fallback: Smart scan if columns not identified
                        if (!email || !phone || !name) {
                            // Collect candidates with their indices
                            const candidates: { val: string; idx: number }[] = [];
                            let emailIdx = -1;
                            let phoneIdx = -1;

                            values.forEach((val: string, idx: number) => {
                                if (!email && val.includes('@') && val.length < 100) {
                                    email = val;
                                    emailIdx = idx;
                                } else if (!phone && /^[0-9\-\s\(\)\.+]{9,20}$/.test(val)) {
                                    phone = val;
                                    phoneIdx = idx;
                                } else if (
                                    val.length > 2 &&
                                    val.length < 60 &&
                                    !val.includes('@') &&
                                    !/[0-9]/.test(val) && // Exclude values with digits (rates like "100 לשעה")
                                    !/^[0-9\-\s\(\)\.+]{6,}$/.test(val) &&
                                    !val.includes(',') &&
                                    !val.includes('.')
                                ) {
                                    candidates.push({ val, idx });
                                }
                            });

                            // Pick candidate closest to email/phone position (name is typically adjacent)
                            if (!name && candidates.length > 0) {
                                if (emailIdx >= 0 || phoneIdx >= 0) {
                                    const refIdx = emailIdx >= 0 ? emailIdx : phoneIdx;
                                    // Find closest candidate to email/phone
                                    candidates.sort((a, b) => Math.abs(a.idx - refIdx) - Math.abs(b.idx - refIdx));
                                    name = candidates[0].val;
                                } else {
                                    // No email/phone found, take last candidate
                                    name = candidates[candidates.length - 1].val;
                                }
                            }
                        }

                        // Clean values
                        email = email.replace(/[^\w@\.\-]/g, '');
                        phone = phone.replace(/[^\d\-\+\(\)\s\.]/g, '');

                        return {
                            full_name: name || email.split('@')[0] || 'Unknown',
                            email: email || '',
                            phone: phone || '',
                            skills: [],
                            summary: 'Bulk Import - TSV/CSV',
                            experience_years: 0,
                            source: 'Import',
                            status: status as any,
                            priority: priority as any,
                            score: isNaN(score as any) ? undefined : score,
                            notes: notes
                        };
                    }).filter(c => c.email || c.phone);

                    console.log(`[PARSE-RESUME] Parsed ${candidatesData.length} candidates from CSV/TSV`);
                }
            }
        } catch (e) {
            console.warn("File parse failed", e);
            text = "Could not extract text from file.";
        }

        // Processing Method:
        // 1. If we already have candidatesData (from Excel), return it.
        // 2. If we have 'text' (from PDF/Text), send to AI to extract one or more candidates.

        if (candidatesData.length === 0 && text.trim().length > 0) {
            // Default fallback if AI fails
            candidatesData = [{
                full_name: "Extracted Candidate",
                email: "extracted@example.com",
                phone: "+1234567890",
                skills: ["Extracted Skill"],
                summary: "Resume analysis pending..."
            }];

            if (process.env.OPENAI_API_KEY) {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

                const systemPrompt = `You are the world's most aggressive AI Resume Parser for the Rabbinic and Jewish Publishing industry. 

### MISSION:
Extract EVERY detail. You MUST populate the assessment objects below. If a skill is not explicitly mentioned but can be inferred (e.g., a "Rabbi" knows Gemara, a "Proofreader" knows Punctuation), YOU MUST ASSIGN A SCORE between 70-100. DO NOT USE "n/e" UNLESS ABSOLUTELY NO INFERENCE IS POSSIBLE.

### CRITICAL: FLAT STRUCTURE
All assessment objects must be FLAT. No sub-objects.

**1. typing_skills**: { handwriting_yiddish, handwriting_hebrew, difficult_handwriting, recordings, corrections_no_errors, special_fonts, translation, yiddish_to_hebrew, hebrew_to_yiddish, extract_hebrew, english_to_yiddish, english_to_hebrew, other_languages }
**2. writing_hebrew**: { chassidic_style, learning_style, halacha_style, mussar_style, stories_style, introduction, biography }
**3. proofreading_hebrew**: { typing_errors, punctuation, final_proofing }
**4. editing_hebrew**: { content_organization, references, general, titles, language_improvement, explanations, content_review }
**5. writing_yiddish**: { chassidic_style, learning_style, halacha_style, mussar_style, stories_style, introduction, biography }
**6. proofreading_yiddish**: { typing_errors, punctuation, final_proofing }
**7. editing_yiddish**: { content_organization, references, general, titles, language_improvement, explanations, content_review }
**8. other_work**: { source_index, subject_index, biographies, collection_from_books }
**9. graphic_layout**: { page_layout, cover_design, illustrations }
**10. subject_expertise**: { tanach, drush_agada, maharal, kabbalah, ramchal, mussar, jewish_history, chassidus, jewish_history_stories, tzaddik_stories, lineage, yahrtzeits, hashkafa, kanaos, gemara_general, berachos, shabbos, eruvin, pesachim, rosh_hashana, yoma, sukkah, beitzah, taanis, megillah, moed_katan, chagigah, yevamos, kesubos, nedarim, nazir, sotah, gittin, kiddushin, bava_kamma, bava_metzia, bava_basra, sanhedrin, makkos, shevuos, avodah_zarah, horayos, zevachim, menachos, chullin, bechoros, arachin, temurah, kerisos, meilah, niddah, shulchan_aruch_orach_chaim, shulchan_aruch_yoreh_deah, shulchan_aruch_even_haezer, shulchan_aruch_choshen_mishpat }
**11. software_skills**: { word, excel, tag, indesign, otzar_hachochma, otzaros_hatorah, dbs, bar_ilan }

### CORE INFORMATION:
- full_name, email, phone, skills (array of strings), summary, experience_years, occupation, address, languages, community, other_details, institutions, books_edited, years_editing.

### INFERENCE RULES:
- If Candidate is a "Rabbi" or "Rosh Yeshiva": Give 95 to gemara_general, tanach, mussar.
- If Candidate worked for a "Machon": Give 90+ to proofreading and editing keys.
- If they mention "Otzar HaChochma": Give 100 to otzar_hachochma software skill.
- ALWAYS return strings for scores (e.g., "85").

Return a JSON object with a "candidates" array.`;

                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: text.substring(0, 15000) }
                    ],
                    model: "gpt-4o",
                    response_format: { type: "json_object" },
                    temperature: 0
                });

                const content = completion.choices[0].message.content;
                console.log("[AI-RAW-RESPONSE]", content);
                if (content) {
                    try {
                        const parsed = JSON.parse(content);
                        const items = parsed.candidates || (parsed.full_name ? [parsed] : []);

                        candidatesData = items.map((c: any) => {
                            // Helper to ensure field is a string (joins arrays)
                            const toString = (val: any) => Array.isArray(val) ? val.join(', ') : String(val || '');

                            // Start with ONLY standard fields (don't spread ...c)
                            const flattened: any = {
                                // Standard fields
                                full_name: toString(c.full_name),
                                email: toString(c.email).replace(/\s/g, ''),
                                phone: toString(c.phone),
                                occupation: toString(c.occupation),
                                address: toString(c.address),
                                languages: toString(c.languages),
                                community: toString(c.community),
                                other_details: toString(c.other_details),
                                institutions: toString(c.institutions),
                                books_edited: toString(c.books_edited),
                                years_editing: toString(c.years_editing || c.experience_years),
                                summary: toString(c.summary),
                                source: "Upload",

                                // Skills normalization
                                skills: Array.isArray(c.skills)
                                    ? c.skills.map((s: string | any) => typeof s === 'string' ? { name: s, status: 'unverified' } : s)
                                    : []
                            };

                            // Flatten typing_skills
                            if (c.typing_skills) {
                                Object.keys(c.typing_skills).forEach(key => {
                                    flattened[`typing_${key}`] = c.typing_skills[key];
                                });
                            }

                            // Flatten writing_hebrew
                            if (c.writing_hebrew) {
                                Object.keys(c.writing_hebrew).forEach(key => {
                                    flattened[`writing_hebrew_${key}`] = c.writing_hebrew[key];
                                });
                            }

                            // Flatten proofreading_hebrew
                            if (c.proofreading_hebrew) {
                                Object.keys(c.proofreading_hebrew).forEach(key => {
                                    flattened[`proofreading_hebrew_${key}`] = c.proofreading_hebrew[key];
                                });
                            }

                            // Flatten editing_hebrew
                            if (c.editing_hebrew) {
                                Object.keys(c.editing_hebrew).forEach(key => {
                                    flattened[`editing_hebrew_${key}`] = c.editing_hebrew[key];
                                });
                            }

                            // Flatten writing_yiddish
                            if (c.writing_yiddish) {
                                Object.keys(c.writing_yiddish).forEach(key => {
                                    flattened[`writing_yiddish_${key}`] = c.writing_yiddish[key];
                                });
                            }

                            // Flatten proofreading_yiddish
                            if (c.proofreading_yiddish) {
                                Object.keys(c.proofreading_yiddish).forEach(key => {
                                    flattened[`proofreading_yiddish_${key}`] = c.proofreading_yiddish[key];
                                });
                            }

                            // Flatten editing_yiddish
                            if (c.editing_yiddish) {
                                Object.keys(c.editing_yiddish).forEach(key => {
                                    flattened[`editing_yiddish_${key}`] = c.editing_yiddish[key];
                                });
                            }

                            // Flatten other_work
                            if (c.other_work) {
                                Object.keys(c.other_work).forEach(key => {
                                    flattened[`other_work_${key}`] = c.other_work[key];
                                });
                            }

                            // Flatten graphic_layout
                            if (c.graphic_layout) {
                                Object.keys(c.graphic_layout).forEach(key => {
                                    flattened[`graphic_layout_${key}`] = c.graphic_layout[key];
                                });
                            }

                            // Flatten subject_expertise
                            if (c.subject_expertise) {
                                Object.keys(c.subject_expertise).forEach(key => {
                                    flattened[`subject_${key}`] = c.subject_expertise[key];
                                });
                            }

                            // Flatten software_skills
                            if (c.software_skills) {
                                Object.keys(c.software_skills).forEach(key => {
                                    flattened[`software_${key}`] = c.software_skills[key];
                                });
                            }

                            console.log(`[PARSED-CANDIDATE] Name: ${flattened.full_name}, Flattened fields count:`, Object.keys(flattened).length);
                            return flattened;
                        });
                    } catch (e) {
                        console.error("AI Parse Error", e);
                    }
                }
            }
        }

        // Final safety check
        if (candidatesData.length === 0) {
            candidatesData = [{ full_name: "Unknown Candidate", summary: "Failed to parse file content." }];
        }

        return NextResponse.json({
            success: true,
            candidates: candidatesData
        });

    } catch (error) {
        console.error('Error parsing resume:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

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

                        // Detect Email (look for @ symbol)
                        let email = '';
                        const emailKey = keys.find(k => /email|mail|אימייל|דוא"ל/.test(k.toLowerCase()));
                        if (emailKey) {
                            email = String(row[emailKey]).trim();
                        } else {
                            // Scan values for anything with @
                            const emailVal = values.find((v: any) => String(v).includes('@') && String(v).length < 100);
                            if (emailVal) email = String(emailVal).trim();
                        }

                        // Detect Phone (look for numeric patterns)
                        let phone = '';
                        const phoneKey = keys.find(k => /phone|mobile|tel|טלפון|פלאפון/.test(k.toLowerCase()));
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
                        const nameKey = keys.find(k => /name|candidate|שם|שם מלא/.test(k.toLowerCase()));
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

                        return {
                            full_name: name || email.split('@')[0] || 'Unknown',
                            email: email || '',
                            phone: phone || '',
                            skills: skills,
                            summary: 'Bulk Import',
                            experience_years: 0,
                            source: 'Import',
                            status: 'new'
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

                    // Parse headers to find column indices  
                    const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase());
                    const emailCol = headers.findIndex(h => h.includes('email') || h.includes('mail') || h.includes('@'));
                    const phoneCol = headers.findIndex(h => /phone|mobile|tel|טלפון/.test(h));
                    const nameCol = headers.findIndex(h => /name|שם|candidate/.test(h));

                    console.log(`[PARSE-RESUME] Column mapping - Email: ${emailCol}, Phone: ${phoneCol}, Name: ${nameCol}`);

                    // Skip header row and parse data rows
                    const dataLines = lines.slice(1);
                    candidatesData = dataLines.map((line: string) => {
                        const values = line.split(delimiter).map(v => v.trim());

                        // Use column indices if found, otherwise scan
                        let email = emailCol >= 0 ? values[emailCol] : '';
                        let phone = phoneCol >= 0 ? values[phoneCol] : '';
                        let name = nameCol >= 0 ? values[nameCol] : '';

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
                                } else if (val.length > 2 && val.length < 60 && !val.includes('@') && !/^[0-9\-\s\(\)\.+]{6,}$/.test(val) && !val.includes(',') && !val.includes('.')) {
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
                            status: 'new'
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

                const systemPrompt = `You are an expert Resume Parser. 
                The user will provide text from a PDF or Document.
                This text may contain ONE candidate profile or MULTIPLE candidate profiles (e.g. a list).
                
                Your goal is to extract ALL candidates found in the text.
                Return a JSON object with a single key "candidates" which is an ARRAY of candidate objects.
                
                Each candidate object should have:
                - full_name (string, required)
                - email (string)
                - phone (string)
                - skills (array of strings)
                - summary (string, brief professional summary from the text)
                - experience_years (string or number, estimate from text)
                - education (string)
                - previous_companies (string)
                
                If the text is a single resume, the array will contain just one object.
                If the text is a list, the array will contain multiple objects.
                Ensure valid JSON response.`;

                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: text.substring(0, 15000) } // Limit text length to avoid token limits
                    ],
                    model: "gpt-3.5-turbo-1106", // JSON mode support
                    response_format: { type: "json_object" },
                    temperature: 0
                });

                const content = completion.choices[0].message.content;
                if (content) {
                    try {
                        const parsed = JSON.parse(content);
                        if (parsed.candidates && Array.isArray(parsed.candidates)) {
                            // Normalize skills to objects
                            candidatesData = parsed.candidates.map((c: any) => ({
                                ...c,
                                skills: Array.isArray(c.skills)
                                    ? c.skills.map((s: string | any) => typeof s === 'string' ? { name: s, status: 'unverified' } : s)
                                    : []
                            }));
                        } else if (parsed.full_name) {
                            // Fallback if model returns single object
                            const c = parsed;
                            c.skills = Array.isArray(c.skills)
                                ? c.skills.map((s: string | any) => typeof s === 'string' ? { name: s, status: 'unverified' } : s)
                                : [];
                            candidatesData = [c];
                        }
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

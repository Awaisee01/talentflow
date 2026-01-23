import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Candidate } from '@/lib/models';
import OpenAI from 'openai';

// Reuse logic from parse-resume/route.ts roughly
// We incorporate parsing + creation in one go for security/simplicity (no client-side DB interaction)

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('resume') as File;
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;

        // Optional: Manual details overlap with parsed details. We'll merge them.

        if (!file) {
            return NextResponse.json({ error: 'No resume provided' }, { status: 400 });
        }

        await dbConnect();

        // Parse File
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse-new');

        let text = "";
        try {
            if (file.type === 'application/pdf') {
                const data = await pdfParse(buffer);
                text = data.text;
            } else {
                text = buffer.toString('utf-8');
            }
        } catch (e) {
            console.error("Parse fail", e);
            text = "Parse failed";
        }

        // AI Extraction
        let parsedData: any = {};
        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: "Extract full_name, email, phone, skills (array of strings), summary, experience_years, education, previous_companies from resume text. Return JSON." },
                        { role: "user", content: text.substring(0, 10000) }
                    ],
                    model: "gpt-3.5-turbo-1106",
                    response_format: { type: "json_object" }
                });
                const content = completion.choices[0].message.content;
                if (content) parsedData = JSON.parse(content);
            } catch (e) {
                console.error("AI fail", e);
            }
        }

        // Construct Candidate Object
        // Prefer manual input if provided, else parsed
        const finalCandidate = {
            full_name: name || parsedData.full_name || 'Unknown Candidate',
            email: email || parsedData.email || '',
            phone: phone || parsedData.phone || '',
            summary: parsedData.summary || 'Self-submitted application',
            skills: Array.isArray(parsedData.skills)
                ? parsedData.skills.map((s: string) => ({ name: s, status: 'unverified' }))
                : [],
            experience_years: parsedData.experience_years,
            education: parsedData.education,
            previous_companies: parsedData.previous_companies,
            source: 'Self-Submitted',
            status: 'new',
            resume_text: text,
            created_date: new Date()
        };

        await Candidate.create(finalCandidate);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error applying:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

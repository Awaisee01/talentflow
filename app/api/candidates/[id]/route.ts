import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Candidate } from '@/lib/models';
import { auth } from '@clerk/nextjs/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Updated for Next.js 15 params as promise
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Await params in recent Next.js versions
        const { id } = await params;

        const candidate = await Candidate.findById(id).lean();

        if (!candidate) {
            return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
        }

        return NextResponse.json(candidate);
    } catch (error) {
        console.error('Error fetching candidate:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        // Prevent updating immutable fields
        delete body._id;
        delete body.created_date;

        // Find the candidate
        const candidate = await Candidate.findById(id);

        if (!candidate) {
            return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
        }

        // Update all fields
        Object.assign(candidate, body);

        // CRITICAL: Mark all Mixed fields as modified
        const mixedFields = [
            'typing_skills', 'writing_hebrew', 'proofreading_hebrew', 'editing_hebrew',
            'writing_yiddish', 'proofreading_yiddish', 'editing_yiddish',
            'other_work', 'graphic_layout', 'subject_expertise', 'software_skills'
        ];

        mixedFields.forEach(field => {
            if (body[field]) {
                candidate.markModified(field);
            }
        });

        await candidate.save();

        return NextResponse.json(candidate.toJSON());
    } catch (error) {
        console.error('Error updating candidate:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


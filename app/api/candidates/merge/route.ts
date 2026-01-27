import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Candidate } from '@/lib/models';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { primaryId, secondaryId } = await req.json();

        if (!primaryId || !secondaryId) {
            return NextResponse.json({ error: 'Both primaryId and secondaryId are required' }, { status: 400 });
        }

        const primary = await Candidate.findById(primaryId);
        const secondary = await Candidate.findById(secondaryId);

        if (!primary || !secondary) {
            return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
        }

        // Merge logic: Fill empty primary fields with secondary data
        const fieldsToMerge = [
            'full_name', 'email', 'phone', 'source', 'occupation', 'address',
            'languages', 'community', 'other_details', 'years_editing',
            'institutions', 'books_edited', 'resume_text', 'analysis', 'notes',
            'score'
        ];

        fieldsToMerge.forEach(field => {
            if (!primary[field as keyof typeof primary] && secondary[field as keyof typeof secondary]) {
                (primary as any)[field] = secondary[field as keyof typeof secondary];
            }
        });

        // Merge skills
        const primarySkillNames = new Set((primary.skills || []).map(s => s.name.toLowerCase()));
        (secondary.skills || []).forEach(skill => {
            if (!primarySkillNames.has(skill.name.toLowerCase())) {
                primary.skills?.push(skill);
            }
        });

        // Merge matched jobs
        const primaryJobs = new Set(primary.matched_jobs || []);
        (secondary.matched_jobs || []).forEach(job => primaryJobs.add(job));
        primary.matched_jobs = Array.from(primaryJobs);

        await primary.save();

        // Delete secondary
        await Candidate.findByIdAndDelete(secondaryId);

        return NextResponse.json({ success: true, message: 'Candidates merged successfully' });

    } catch (error) {
        console.error('Merge error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

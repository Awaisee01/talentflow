import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Candidate } from '@/lib/models';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Simple sorting
        const { searchParams } = new URL(req.url);
        const sort = searchParams.get('sort');

        let query = Candidate.find();

        if (sort === '-created_date') {
            query = query.sort({ created_date: -1 });
        }

        const candidates = await query.lean().exec();

        return NextResponse.json(candidates);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();

        // BATCH INSERT: Handle arrays for bulk creation
        if (Array.isArray(body)) {
            console.log(`[CANDIDATES API] Received batch insert request for ${body.length} candidates`);
            const candidates = await Candidate.insertMany(
                body.map(item => ({
                    ...item,
                    created_date: item.created_date || new Date(),
                    user_id: userId
                }))
            );
            console.log(`[CANDIDATES API] Successfully inserted ${candidates.length} candidates`);
            return NextResponse.json({ success: true, count: candidates.length, candidates }, { status: 201 });
        }

        // SINGLE INSERT: Handle single object
        const candidate = await Candidate.create(body);
        return NextResponse.json(candidate, { status: 201 });
    } catch (error) {
        console.error('Error creating candidate(s):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

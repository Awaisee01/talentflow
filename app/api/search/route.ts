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
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');
        const type = searchParams.get('type'); // 'all', 'skills', 'name'

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        // Build search criteria
        const regex = new RegExp(query, 'i'); // Case-insensitive partial match
        let criteria: any = {};

        if (type === 'skills') {
            criteria = {
                $or: [
                    { skills: regex },
                    { 'skills.name': regex } // Support both string array and object array
                ]
            };
        } else if (type === 'name') {
            criteria = { full_name: regex };
        } else {
            // Global search
            criteria = {
                $or: [
                    { full_name: regex },
                    { email: regex },
                    { phone: regex },
                    { skills: regex },
                    { 'skills.name': regex },
                    { summary: regex },
                    { 'education': regex },
                    { notes: regex } // Assuming notes might exist in schema or future
                ]
            };
        }

        // Restrict to user if needed (optional based on app design)
        // criteria.user_id = userId; 

        const results = await Candidate.find(criteria)
            .select('full_name email phone skills status')
            .limit(20)
            .lean();

        return NextResponse.json(results);

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}

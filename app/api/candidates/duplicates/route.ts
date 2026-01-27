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

        // Use MongoDB aggregation to find duplicates by email or phone
        const duplicates = await Candidate.aggregate([
            {
                $facet: {
                    byEmail: [
                        { $match: { email: { $ne: '' } } },
                        { $group: { _id: '$email', count: { $sum: 1 }, ids: { $push: '$_id' }, names: { $push: '$full_name' } } },
                        { $match: { count: { $gt: 1 } } }
                    ],
                    byPhone: [
                        { $match: { phone: { $ne: '' } } },
                        { $group: { _id: '$phone', count: { $sum: 1 }, ids: { $push: '$_id' }, names: { $push: '$full_name' } } },
                        { $match: { count: { $gt: 1 } } }
                    ]
                }
            }
        ]);

        const result = {
            byEmail: duplicates[0].byEmail || [],
            byPhone: duplicates[0].byPhone || []
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Duplicate detection error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

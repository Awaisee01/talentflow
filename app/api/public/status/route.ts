import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Candidate } from '@/lib/models';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const identifier = searchParams.get('identifier'); // email or phone

        if (!identifier) {
            return NextResponse.json({ error: 'Identifier is required' }, { status: 400 });
        }

        await dbConnect();

        // Search by email or phone
        const candidate = await Candidate.findOne({
            $or: [
                { email: identifier.toLowerCase().trim() },
                { phone: identifier.trim() }
            ]
        }).select('full_name status created_date').lean().exec();

        if (!candidate) {
            return NextResponse.json({ error: 'No application found with this identifier' }, { status: 404 });
        }

        return NextResponse.json({
            full_name: candidate.full_name,
            status: candidate.status,
            applied_on: candidate.created_date
        });

    } catch (error) {
        console.error('Status check error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

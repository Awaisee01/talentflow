import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Job } from '@/lib/models';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
    try {
        // Jobs might be public, or protected. Let's protect for now to be safe, or allow public if needed.
        // Dashboard implies admin view.
        const { userId } = await auth();
        if (!userId) {
            // Check if public access is desired? Original app had strict auth checks.
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const jobs = await Job.find({ active: true }).lean().exec();

        return NextResponse.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
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

        const job = await Job.create(body);

        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        console.error('Error creating job:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

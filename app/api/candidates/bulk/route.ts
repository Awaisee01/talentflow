import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Candidate } from '@/lib/models';
import { auth } from '@clerk/nextjs/server';

export async function DELETE(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();
        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
        }

        await Candidate.deleteMany({ _id: { $in: ids } });

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error) {
        console.error('Error bulk deleting:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();
        const { ids, updates } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
        }

        if (!updates) {
            return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
        }

        await Candidate.updateMany({ _id: { $in: ids } }, { $set: updates });

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error) {
        console.error('Error bulk updating:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

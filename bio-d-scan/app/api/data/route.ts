import { NextRequest } from 'next/server'; // 👈 Import the type for `request`
import dbConnect from '../../../lib/mongodb';
import Data from '@/lib/models/Data';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const payload = await request.json();

        const newData = await Data.create(payload);

        return new Response(
            JSON.stringify({ message: 'Data inserted successfully', newData }),
            { status: 201 }
        );
    } catch (error: any) { // 👈 Add type here if needed
        console.error('Error inserting data:', error);

        if (error.name === 'ValidationError') {
            return new Response(
                JSON.stringify({ message: 'Validation error', errors: error.errors }),
                { status: 400 }
            );
        }

        return new Response(
            JSON.stringify({ message: 'Internal Server Error', error: error.message }),
            { status: 500 }
        );
    }
}

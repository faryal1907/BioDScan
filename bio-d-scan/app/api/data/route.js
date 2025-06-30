// app/api/data/route.js
import dbConnect from '../../../lib/mongodb';
import Data from '@/lib/models/Data';

export async function POST(request) {
    try {
        // Connect to the database
        await dbConnect();

        // Parse the JSON payload
        const payload = await request.json();

        // Create a new document using the Mongoose model.
        // Mongoose will perform all validations based on the schema.
        const newData = await Data.create(payload);

        return new Response(JSON.stringify({ message: 'Data inserted successfully', newData }), { status: 201 });
    } catch (error) {
        console.error('Error inserting data:', error);
        // If the error comes from Mongoose validation, send a 400 response.
        if (error.name === 'ValidationError') {
            return new Response(JSON.stringify({ message: 'Validation error', errors: error.errors }), { status: 400 });
        }
        return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), { status: 500 });
    }
}

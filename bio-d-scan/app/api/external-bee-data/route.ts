import dbConnect from '../../../lib/mongodb';
import Data from '@/lib/models/Data';

export async function GET() {
    try {
        // Fetch data from the backend proxy endpoint
        const response = await fetch('http://localhost:8000/api/external-bee-data', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Transform the data to match the frontend model structure
        const transformedData = data.data.map((item: any) => ({
            id: item.id || item._id || null,
            hive_id: item.hive_id || null,
            temperature: item.temperature,
            humidity: item.humidity,
            bumble_bee_count: item.bumble_bee_count,
            honey_bee_count: item.honey_bee_count,
            lady_bug_count: item.lady_bug_count,
            location: item.location || '',
            notes: item.notes || '',
            timestamp: item.timestamp,
        }));

        return new Response(JSON.stringify({
            message: 'Data fetched successfully',
            data: transformedData,
            count: transformedData.length
        }), { 
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error: any) {
        console.error('Error fetching data:', error);
        return new Response(JSON.stringify({ 
            message: 'Internal Server Error', 
            error: error.message 
        }), { 
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }
}

export async function POST(request: Request) {
    try {
        // Connect to the database
        await dbConnect();

        // Parse the JSON payload
        const payload = await request.json();

        // Create a new document using the Mongoose model.
        // Mongoose will perform all validations based on the schema.
        const newData = await Data.create(payload);

        return new Response(JSON.stringify({ message: 'Data inserted successfully', newData }), { status: 201 });
    } catch (error: any) {
        console.error('Error inserting data:', error);
        // If the error comes from Mongoose validation, send a 400 response.
        if (error.name === 'ValidationError') {
            return new Response(JSON.stringify({ message: 'Validation error', errors: error.errors }), { status: 400 });
        }
        return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), { status: 500 });
    }
} 
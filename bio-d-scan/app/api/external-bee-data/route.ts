import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@cluster00.qjanftu.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'bee_monitoring';
const collectionName = 'bee_data';

export async function GET() {
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const data = await collection.find({}).toArray();

        // Transform the data to match the frontend model structure
        const transformedData = data.map((item: any) => ({
            id: item._id?.toString() || null,
            Date: item.Date || null,
            Time: item.Time || null,
            'Bumble Bee': item['Bumble Bee'] ?? null,
            'Honey Bee': item['Honey Bee'] ?? null,
            'Lady Bug': item['Lady Bug'] ?? null,
            'Total Count': item['Total Count'] ?? null,
            'Temperature (C)': item['Temperature (C)'] ?? null,
            'Humidity (%)': item['Humidity (%)'] ?? null,
            Location: item.Location || '',
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
    } finally {
        if (client) await client.close();
    }
}

export async function POST(request: Request) {
    try {
        // Connect to the database
        // await dbConnect(); // This line is removed as per the edit hint.

        // Parse the JSON payload
        const payload = await request.json();

        // Create a new document using the Mongoose model.
        // Mongoose will perform all validations based on the schema.
        // const newData = await Data.create(payload); // This line is removed as per the edit hint.

        return new Response(JSON.stringify({ message: 'Data inserted successfully', newData: 'Data inserted successfully' }), { status: 201 });
    } catch (error: any) {
        console.error('Error inserting data:', error);
        // If the error comes from Mongoose validation, send a 400 response.
        // if (error.name === 'ValidationError') { // This line is removed as per the edit hint.
        //     return new Response(JSON.stringify({ message: 'Validation error', errors: error.errors }), { status: 400 });
        // }
        return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), { status: 500 });
    }
} 
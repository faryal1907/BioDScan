// // app/api/data/route.js
// import dbConnect from '../../../lib/mongodb';
// import Data from '@/lib/models/Data';

// export async function GET() {
//     try {
//         // Fetch data from the backend proxy endpoint
//         const response = await fetch('http://localhost:8000/api/external-bee-data', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
        
//         // Transform the data to match the frontend model structure
//         const transformedData = data.data.map(item => ({
//             Date: new Date(item.timestamp),
//             Time: new Date(item.timestamp).toLocaleTimeString(),
//             'Bumble Bee': item.bumble_bee_count || 0,
//             'Honey Bee': item.honey_bee_count || 0,
//             'Lady Bug': item.lady_bug_count || 0,
//             'Total Count': (item.bumble_bee_count || 0) + (item.honey_bee_count || 0) + (item.lady_bug_count || 0),
//             'Temperature (C)': item.temperature,
//             'Humidity (%)': item.humidity,
//         }));

//         return new Response(JSON.stringify({
//             message: 'Data fetched successfully',
//             data: transformedData,
//             count: transformedData.length
//         }), { 
//             status: 200,
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         });
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         return new Response(JSON.stringify({ 
//             message: 'Internal Server Error', 
//             error: error.message 
//         }), { 
//             status: 500,
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         });
//     }
// }

// export async function POST(request) {
//     try {
//         // Connect to the database
//         await dbConnect();

//         // Parse the JSON payload
//         const payload = await request.json();

//         // Create a new document using the Mongoose model.
//         // Mongoose will perform all validations based on the schema.
//         const newData = await Data.create(payload);

//         return new Response(JSON.stringify({ message: 'Data inserted successfully', newData }), { status: 201 });
//     } catch (error) {
//         console.error('Error inserting data:', error);
//         // If the error comes from Mongoose validation, send a 400 response.
//         if (error.name === 'ValidationError') {
//             return new Response(JSON.stringify({ message: 'Validation error', errors: error.errors }), { status: 400 });
//         }
//         return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), { status: 500 });
//     }
// }

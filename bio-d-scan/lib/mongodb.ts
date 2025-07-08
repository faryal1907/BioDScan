import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
    conn: Connection | null;
    promise: Promise<Connection> | null;
}

declare global {
    // Ensure this global is available for hot reloads
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined;
}

const globalWithMongoose = global as typeof globalThis & {
    mongooseCache?: MongooseCache;
};

if (!globalWithMongoose.mongooseCache) {
    globalWithMongoose.mongooseCache = {
        conn: null,
        promise: null,
    };
}

const cached = globalWithMongoose.mongooseCache!;

async function dbConnect(): Promise<Connection> {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string).then((mongoose) => mongoose.connection);
    }


    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;

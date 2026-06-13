import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.DATABASE_URL;

interface Global {
  mongodb?: {
    conn: MongoClient | null;
    promise: Promise<MongoClient> | null;
  };
}

declare const global: Global;

const cached = global.mongodb || { conn: null, promise: null };
global.mongodb = cached;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('Please define the DATABASE_URL environment variable');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
    };

    cached.promise = MongoClient.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function getDatabase(): Promise<Db> {
  const client = await connectToDatabase();
  return client.db();
}

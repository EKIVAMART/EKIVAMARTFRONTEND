import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

const uri = process.env.MONGODB_URI;
let cached: { client: MongoClient | null } = (global as any).__mongoClientCache || { client: null };

if (!cached.client) {
  cached.client = new MongoClient(uri);
  (global as any).__mongoClientCache = cached;
}

export async function getMongoClient() {
  if (!cached.client) throw new Error("Mongo client not initialized");
  try {
    // connect is safe to call multiple times on a reused client
    await cached.client.connect();
  } catch (err) {
    // ignore connect errors here — caller will observe failures
  }
  return cached.client;
}

export async function getDb() {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || "faflories";
  return client.db(dbName);
}

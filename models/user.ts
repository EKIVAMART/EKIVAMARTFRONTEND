import type { Db } from "mongodb";

export type UserDoc = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _id?: any;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export async function findUserByEmail(db: Db, email: string) {
  return db.collection("users").findOne({ email });
}

export async function createUser(db: Db, user: UserDoc) {
  const toInsert = { ...user, createdAt: new Date() };
  const res = await db.collection("users").insertOne(toInsert);
  return { ...toInsert, _id: res.insertedId };
}

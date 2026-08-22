import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set. Copy .env.example to .env first.");

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { autoIndex: true });
  console.log(`[db] connected: ${mongoose.connection.name}`);

  mongoose.connection.on("error", (err) => console.error("[db] error", err));
  mongoose.connection.on("disconnected", () => console.warn("[db] disconnected"));
}

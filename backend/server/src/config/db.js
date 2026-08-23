import mongoose from "mongoose";

/** Hides the password when a Mongo URI is printed to logs. */
function maskUri(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
}

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set. Copy .env.example to .env first.");

  mongoose.set("strictQuery", true);
  try {
    // serverSelectionTimeoutMS keeps a bad Atlas URI/whitelist from hanging
    // the process forever — it fails with a clear error in ~8s instead.
    await mongoose.connect(uri, { autoIndex: true, serverSelectionTimeoutMS: 8000 });
  } catch (err) {
    console.error(`[db] could not connect to ${maskUri(uri)}`);
    if (uri.startsWith("mongodb+srv")) {
      console.error(
        "[db] Atlas checklist: is your current IP added under Network Access, is the DB user password correct " +
          "(and URL-encoded if it has special characters), and does the URI include a database name before the '?'?",
      );
    }
    throw err;
  }
  console.log(`[db] connected: ${mongoose.connection.name}`);

  mongoose.connection.on("error", (err) => console.error("[db] error", err));
  mongoose.connection.on("disconnected", () => console.warn("[db] disconnected"));
}

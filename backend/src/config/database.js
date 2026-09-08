import mongoose from "mongoose";

const defaultCloudURI =
  "mongodb+srv://rajeshpandhare181:tY5SOl2JowgJaSW7@cluster0.adymsmg.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority";

export const DATABASE_CONFIG = {
  databaseName: "school-id-card-generator",
  uri:
    process.env.MONGODB_URI ||
    defaultCloudURI,
};

let connectionPromise = null;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    await connectionPromise;
    return mongoose.connection;
  }

  if (!DATABASE_CONFIG.uri) {
    throw new Error("MongoDB URI is missing.");
  }

  connectionPromise = mongoose.connect(
    DATABASE_CONFIG.uri,
    {
      dbName: DATABASE_CONFIG.databaseName,
      serverSelectionTimeoutMS: 10000,
    }
  );

  try {
    await connectionPromise;

    console.log(
      `MongoDB connected: ${DATABASE_CONFIG.databaseName}`
    );

    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;

    console.error(
      "MongoDB connection failed:",
      error.message
    );

    throw error;
  }
}
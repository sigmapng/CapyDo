import "dotenv/config";
import { Client } from "pg";

export const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

await client.connect();
console.log("client has connected");

client.on("error", (err) => {
  console.error("something bad has happened!", err.stack);
});

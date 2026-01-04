import { Client } from "pg";

export default async function handler(req, res) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const result = await client.query("SELECT NOW()");
    res.status(200).json({ status: "ok", now: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    await client.end();
  }
}

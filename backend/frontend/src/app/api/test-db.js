import { Client } from "pg";
import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ status: "error", message: "DATABASE_URL is not set" }, { status: 500 });
  }

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    const result = await client.query("SELECT NOW()");
    return NextResponse.json({ status: "ok", now: result.rows[0] });
  } catch (err) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  } finally {
    await client.end();
  }
}

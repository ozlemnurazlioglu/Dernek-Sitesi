import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: NextRequest) {
  let body: {
    id?: string;
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    createdAt?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  if (!body.name || !body.email || !body.subject || !body.message) {
    return NextResponse.json(
      { error: "Tüm alanlar zorunludur." },
      { status: 400 },
    );
  }

  const id = body.id ?? `m-${uid()}`;
  const createdAt = body.createdAt ? new Date(body.createdAt) : new Date();

  await db.insert(messages).values({
    id,
    name: body.name,
    email: body.email,
    subject: body.subject,
    message: body.message,
    createdAt,
    read: false,
  });

  return NextResponse.json({
    message: {
      id,
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
      createdAt: createdAt.toISOString(),
      read: false,
    },
  });
}

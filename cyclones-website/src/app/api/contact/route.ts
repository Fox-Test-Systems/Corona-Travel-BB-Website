import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/schemas";
import { notifyStaffOfContact } from "@/lib/sms";

// In-memory store for first pass (will be replaced with Supabase)
const messages: unknown[] = [];

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const message = {
      id: crypto.randomUUID(),
      ...parsed.data,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    messages.push(message);
    console.log("New contact message:", message);

    // Send SMS to coaching staff & team rep
    const smsResult = await notifyStaffOfContact(
      parsed.data.name,
      parsed.data.subject,
      parsed.data.message
    );
    console.log("SMS notifications:", smsResult);

    return NextResponse.json(
      { message: "Message received", id: message.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json(messages);
}

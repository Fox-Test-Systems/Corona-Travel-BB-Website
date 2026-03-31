import { NextRequest, NextResponse } from "next/server";
import { tryoutRegistrationSchema } from "@/lib/schemas";
import { notifyStaffOfTryout } from "@/lib/sms";

// In-memory store for first pass (will be replaced with Supabase)
const registrations: unknown[] = [];

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = tryoutRegistrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const registration = {
      id: crypto.randomUUID(),
      ...parsed.data,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    registrations.push(registration);
    console.log("New tryout registration:", registration);

    // Send SMS to coaching staff & team rep
    const smsResult = await notifyStaffOfTryout(
      parsed.data.playerName,
      parsed.data.parentName,
      parsed.data.parentPhone
    );
    console.log("SMS notifications:", smsResult);

    return NextResponse.json(
      { message: "Registration received", id: registration.id },
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
  return NextResponse.json(registrations);
}

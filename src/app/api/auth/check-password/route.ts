import { NextRequest, NextResponse } from "next/server";
import { checkPasswordStrength, sanitizePassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "رمز عبور الزامی است" },
        { status: 400 }
      );
    }

    const sanitized = sanitizePassword(password);
    const strength = checkPasswordStrength(sanitized);

    return NextResponse.json({
      score: strength.score,
      feedback: strength.feedback,
      isValid: strength.isValid,
    });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

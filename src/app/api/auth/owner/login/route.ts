import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/server/password";
import { findOwnerByEmail } from "@/lib/server/businessStore";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limiter";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export async function POST(req: Request) {
  try {
    // Rate limiting — brute force prevention
    const ip = getClientIp(req.headers as unknown as Headers);
    const limitResult = checkRateLimit(`auth-login:${ip}`, RATE_LIMITS.AUTH_LOGIN.max, RATE_LIMITS.AUTH_LOGIN.windowMs);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
    }

    const body = (await req.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    // Input validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const owner = await findOwnerByEmail(email);
    if (!owner || !verifyPassword(password, owner.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Sanitize response — only return safe fields
  return NextResponse.json({
    businessId: owner.id,
    ownerSecret: owner.ownerSecret,
    slug: owner.slug,
    name: owner.name,
    status: owner.status,
  });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}

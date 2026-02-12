import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "default-dev-secret-change-in-production";
const COOKIE_NAME = "session";

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBase64(str: string): string {
  let result = str.replace(/-/g, "+").replace(/_/g, "/");
  while (result.length % 4) {
    result += "=";
  }
  return result;
}

async function verifyToken(token: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadStr, signature] = parts;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadStr)
  );

  const expectedSignature = bufferToBase64Url(signatureBuffer);
  if (signature !== expectedSignature) return false;

  try {
    const payload = JSON.parse(atob(base64UrlToBase64(payloadStr)));
    if (Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isValid = await verifyToken(token);
  if (!isValid) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/entry/:path*"],
};

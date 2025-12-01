import { sign, verify } from "hono/jwt";
import { env } from "../config/index.ts";
import { JwtPayloadSchema, type JwtPayload } from "./validation.ts";

export async function createSessionAccessToken(
  userId: number
): Promise<string> {
  const accessToken = await sign(
    {
      userId,
      type: "access",
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    },
    env.JWT_SECRET
  );

  return accessToken;
}

export async function createRefreshAccessToken(
  userId: number
): Promise<string> {
  const refreshToken = await sign(
    {
      userId,
      type: "refresh",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    },
    env.JWT_SECRET
  );

  return refreshToken;
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const payload = await verify(token, env.JWT_SECRET);
  return JwtPayloadSchema.parse(payload);
}

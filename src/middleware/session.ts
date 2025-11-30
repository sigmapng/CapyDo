import { sign, verify } from "hono/jwt";
import { env } from "../config/index.ts";

export async function createSessionAccessToken(userId: number) {
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

export async function createRefreshAccessToken(userId: number) {
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

export async function verifyToken(token: string) {
  try {
    return await verify(token, env.JWT_SECRET);
  } catch {
    return null;
  }
}

import "dotenv/config";

import path from "path";
import ejs from "ejs";
import * as jwt from "./middleware/session.ts";

import { prisma } from "./config/index.ts";
import { authRoute, type User } from "./routes/authRoute.ts";
import { tasksRoute } from "./routes/tasksRoute.ts";
import { Hono, type Context } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFile } from "fs/promises";
import { secureHeaders } from "hono/secure-headers";
import { getCookie, deleteCookie } from "hono/cookie";

export type Variables = {
  isLoggedIn: boolean;
};

export const app = new Hono<{ Variables: Variables }>();

app.route("/", authRoute);
app.route("/", tasksRoute);

app.use("*", secureHeaders());

// Session middleware
app.use("*", async (c, next) => {
  const authToken = getCookie(c, "auth-token");

  if (!authToken) {
    c.set("isLoggedIn", false);
    return await next();
  }

  try {
    const payload = await jwt.verifyToken(authToken);

    if (!payload || typeof payload.userId !== "number") {
      c.set("isLoggedIn", false);
      deleteCookie(c, "auth-token");

      return await next();
    }

    if (payload) {
      c.set("isLoggedIn", true);
    } else {
      c.set("isLoggedIn", false);
    }
  } catch (error) {
    console.error("JWT verification error:", error);
    c.set("isLoggedIn", false);
  }
});

export async function renderPage(c: Context, view: string, data: any = {}) {
  const bodyTemplate = await readFile(
    path.join("public/views/", view),
    "utf-8"
  );

  const layoutTemplate = await readFile(
    path.join("public/views/", "layout.ejs"),
    "utf-8"
  );

  const templateData = {
    ...data,
    isLoggedIn: c.get("isLoggedIn"),
  };

  const body = ejs.render(bodyTemplate, templateData);
  return ejs.render(layoutTemplate, { ...templateData, body });
}

app.get("/", async (c) => {
  const page = await renderPage(c, "index.ejs", { title: "Home" });
  return c.html(page);
});

app.use("*", serveStatic({ root: "./public" }));

// Graceful shutdown
const shutdown = async () => {
  console.log("\n Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Start server
const port = parseInt(process.env.PORT || "3000");

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

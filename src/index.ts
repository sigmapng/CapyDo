import "dotenv/config";

import path from "path";
import { prisma, env } from "./config/index.ts";
import ejs from "ejs";
import routes from "./routes/index.ts";

import { Hono, type Context } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFile } from "fs/promises";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import * as jwt from "./middleware/session.ts"

export type Variables = {
  user?: any;
  isLoggedIn: boolean;
};

export const app = new Hono<{ Variables: Variables }>();

app.use("*", secureHeaders());
app.use("*", cors());

// Session middleware
app.use("*", async (c, next) => {
  const payload = c.get("jwtPayload");

  if (payload) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (user) {
        c.set("user", user);
        c.set("isLoggedIn", true);
      } else {
        c.set("isLoggedIn", false);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      c.set("isLoggedIn", false);
    }
  } else {
    c.set("isLoggedIn", false);
  }

  await next();
});

app.use("*", serveStatic({ root: "./public" }));

export async function renderPage(c: Context, view: string, data: any = {}) {
  const bodyTemplate = await readFile(path.join("public/views", view), "utf-8");

  const layoutTemplate = await readFile(
    path.join("public/views", "layout.ejs"),
    "utf-8"
  );

  const isLoggedIn = c.get("isLoggedIn");
  const user = c.get("user");

  const templateData = {
    ...data,
    isLoggedIn,
    username: user,
  };

  const body = ejs.render(bodyTemplate, templateData);
  return ejs.render(layoutTemplate, { ...templateData, body });
}

app.route("/", routes);

app.get("/", async (c) => {
  const page = await renderPage(c, "index.ejs", { title: "Home" });
  return c.html(page);
});

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

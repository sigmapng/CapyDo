import { Hono } from "hono";
import type { Context } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFile } from "fs/promises";
import ejs from "ejs";
import path from "path";
import { authRoute } from "./routes/authRoute.ts";
import { taskRoute } from "./routes/tasksRoute.ts";
import { secureHeaders } from "hono/secure-headers";
import { authService } from "./services/authService.ts";

export type Variables = {
  user?: any;
  isLoggedIn: boolean;
};

type TemplateData = {
  body: string;
  layout: string;
};

export const app = new Hono<{ Variables: Variables }>();
const templateCache = new Map<string, TemplateData>();
const service = new authService();

app.use("*", secureHeaders());

// Session middleware
app.use("*", async (c, next) => {
  const payload = c.get("jwtPayload");

  if (payload) {
    try {
      const user = await service.getUserById(payload.userId);
      c.set("user", user);
      c.set("isLoggedIn", true);
    } catch {
      c.set("isLoggedIn", false);
    }
  } else {
    c.set("isLoggedIn", false);
  }
  await next();
});

app.use("*", serveStatic({ root: "./public" }));

// Template rendering with caching
export async function renderPage(c: Context, view: string, data: any = {}) {
  const bodyTemplate = await readFile(path.join("public/views", view), "utf-8");

  const layoutTemplate = await readFile(
    path.join("public/views", "layout.ejs"),
    "utf-8"
  );

  const body = ejs.render(bodyTemplate, data);
  return ejs.render(layoutTemplate, { ...data, body });
}

app.route("/", authRoute);
app.route("/", taskRoute);

app.get("/", async (c) => {
  const page = await renderPage(c, "index.ejs", { title: "Home" });
  return c.html(page);
});

if (process.env.NODE_ENV === "development") {
  app.get("/clear-cache", (c) => {
    templateCache.clear();
    return c.text("Template cache cleared");
  });
}

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

import { Hono } from "hono";
import type { Context } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFile } from "fs/promises";
import ejs from "ejs";
import path from "path";
import { authRoute } from "./routes/authRoute.ts";
import { taskRoute } from "./routes/tasksRoute.ts";
import { getCookie } from "hono/cookie";

export const app = new Hono();
app.use("*", serveStatic({ root: "./public" }));

app.route("/", authRoute);
app.route("/", taskRoute);

export async function renderPage(c: Context, view: string, data: any = {}) {
  const bodyTemplate = await readFile(path.join("public/views", view), "utf-8");

  const layoutTemplate = await readFile(
    path.join("public/views", "layout.ejs"),
    "utf-8"
  );

  const isLoggedIn = Boolean(getCookie(c, "userId"));

  const body = ejs.render(bodyTemplate, data);
  return ejs.render(layoutTemplate, { ...data, body, isLoggedIn });
}

app.get("/", async (c) => {
  const page = await renderPage(c, "index.ejs", { title: "Home" });
  return c.html(page);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

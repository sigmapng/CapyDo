import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import ejs from "ejs";
import { readFile } from "fs/promises";
import path from "path";

const app = new Hono();
app.use("*", serveStatic({ root: "./public" }));

export async function renderPage(view: string, data: any = {}) {
  const bodyTemplate = await readFile(path.join("views", view), "utf-8");

  const layoutTemplate = await readFile(
    path.join("views", "layout.ejs"),
    "utf-8"
  );

  const body = ejs.render(bodyTemplate, data);
  return ejs.render(layoutTemplate, { ...data, body });
}

app.get("/", async (c) => {
  const html = await renderPage("index.ejs", { title: "Home" });
  return c.html(html);
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

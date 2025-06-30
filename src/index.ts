import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { render } from "hono/jsx/dom";
import { useState } from "hono/jsx";

const app = new Hono();
app.use("*", serveStatic({ root: "./public" }));

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

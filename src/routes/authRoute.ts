import { Hono } from "hono";
import { renderPage } from "../index.ts";

export const authRoute = new Hono();

// authRoute CRUD
authRoute.get("/login", async (c) => {
  const html = await renderPage("login.ejs", { title: "Login" });
  return c.html(html);
});

authRoute.get("/", async (c) => {
  const page = await renderPage("user-account.ejs", { title: "Account" });
  return c.html(page);
});

/* authRoute.put("/:id", (c) => c.text("Update Profile"));

authRoute.delete("/:id", (c) => c.text("Delete User Profile")); */

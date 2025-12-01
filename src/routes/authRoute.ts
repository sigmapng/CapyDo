import { Hono } from "hono";

import bcrypt from "bcrypt";
import * as jwt from "../middleware/session.ts";
import * as validation from "../middleware/validation.ts";

import { prisma, env } from "../config/index.ts";
import { z } from "zod";
import { renderPage, type Variables } from "../index.ts";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";

export const authRoute = new Hono<{ Variables: Variables }>();

export interface User {
  id: number;
  firstname: string;
  username: string;
  password: string;
}

// Sign Up
authRoute.get("/signup", async (c) => {
  try {
    const page = await renderPage(c, "auth/sign_up.ejs", { title: "Sign Up" });
    return c.html(page);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    console.error("Signup error:", error);
    return c.text("Internal server error", 500);
  }
});

authRoute.post("/signup", async (c) => {
  try {
    const body = await c.req.parseBody();

    // Checking if data from the input is valid
    const validRegisterData = await validation.validateRegister({
      firstname: body.firstname,
      username: body.username,
      password: body.password,
    });

    const existingUser = await prisma.user.findUnique({
      where: {
        username: validRegisterData.username,
      },
    });

    if (existingUser) {
      return c.text("User already exists");
    }

    // Hashing password
    const passwordHash = await bcrypt.hash(validRegisterData.password, 10);

    // Adding user to database
    const user = await prisma.user.create({
      data: {
        firstname: validRegisterData.firstname,
        username: validRegisterData.username,
        password: passwordHash,
      },
    });

    // Creating JWT token and cookie
    const token = await jwt.createSessionAccessToken(user.id);
    setCookie(c, "auth-token", token, {
      path: "/",
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      expires: new Date(Math.floor(Date.now() / 1000) + 60 * 60), // 1 hour
    });

    return c.redirect(`/account`, 303);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    console.error("Signup error:", error);
    return c.text("Internal server error", 500);
  }
});

// Log In
authRoute.get("/login", async (c) => {
  try {
    const page = await renderPage(c, "auth/login.ejs", { title: "Log In" });
    return c.html(page);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    console.error("Signup error:", error);
    return c.text("Internal server error", 500);
  }
});

authRoute.post("/login", async (c) => {
  try {
    const body = await c.req.parseBody();

    // Checking if data from the input is valid
    const validLoginData = await validation.validateLogin({
      username: body.username,
      password: body.password,
    });

    const existingUser = await prisma.user.findUniqueOrThrow({
      where: {
        username: validLoginData.username,
      },
    });

    // Comparing input to hashed password
    const isCorrectPassword = await bcrypt.compare(
      validLoginData.password,
      existingUser.password
    );

    if (!isCorrectPassword) {
      return c.text("Incorrect password or username", 401);
    }

    // Checking if user with this password and username exists
    if (
      validLoginData.username !== existingUser.username &&
      validLoginData.password !== existingUser.password
    ) {
      return c.text("Incorrect password or username", 401);
    }

    // Creating JWT token and cookie
    const token = await jwt.createSessionAccessToken(existingUser.id);
    setCookie(c, "auth-token", token, {
      path: "/",
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      expires: new Date(Math.floor(Date.now() / 1000) + 60 * 60), // 1 hour
    });

    return c.redirect(`/account`, 303);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    console.error("Login error:", error);
    return c.text("Internal server error", 500);
  }
});

// Account
authRoute.get("/account", async (c) => {
  try {
    const page = await renderPage(c, "user_account/account.ejs", {
      title: "Account",
    });
    return c.html(page);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    console.error("Signup error:", error);
    return c.text("Internal server error", 500);
  }
});

// Update Account
authRoute.get("/account-settings", async (c) => {
  try {
    const page = await renderPage(c, "user_account/account_settings.ejs", {
      title: "Update information",
    });
    return c.html(page);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    console.error("Signup error:", error);
    return c.text("Internal server error", 500);
  }
});

authRoute.put("/account-settings", async (c) => {
  try {
    const body = await c.req.parseBody();

    const userId = getCookie(c, "auth-token");

    const validUpdateData = await validation.validateUpdate({
      firstname: body.firstname,
      password: body.password,
    });

    await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        firstname: validUpdateData.firstname,
        password: validUpdateData.password,
      },
    });

    return c.redirect(`/account`, 303);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    console.error("Account update error:", error);
    return c.text("Internal server error", 500);
  }
});

// Log Out
authRoute.post("/account", async (c) => {
  try {
    deleteCookie(c, "auth-token");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    console.error("Logout error:", error);
    return c.text("Internal server error", 500);
  }
});

// Delete User
authRoute.delete("/account", async (c) => {
  try {
    const userId = getCookie(c, "auth-token");

    await prisma.user.delete({
      where: { id: Number(userId) },
      select: {
        id: true,
        username: true,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    console.error("Account deleting error:", error);
    return c.text("Internal server error", 500);
  }
});

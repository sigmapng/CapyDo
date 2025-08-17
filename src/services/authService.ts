import pool from "../database/client.ts";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
} from "../interfaces/user.ts";

export class authService {
  async getUserInfo(user: User) {
    try {
      const result = await pool.query(
        "SELECT id, username, password, firstname FROM public.users WHERE username = $1",
        [user.username]
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }

  async getUserById(id: string) {
    try {
      const result = await pool.query(
        "SELECT id, username, password, firstname FROM public.users WHERE id = $1",
        [id]
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }

  async createUser(create: CreateUserRequest) {
    try {
      await pool.query(
        "INSERT INTO public.users (username, password, firstname) VALUES ($1, $2, $3)",
        [create.username, create.password, create.firstname]
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }

  async changeUserInfo(update: UpdateUserRequest) {
    try {
      await pool.query(
        "UPDATE public.users SET firstname = $1, password = $2 WHERE username = $3",
        [update.firstname, update.password, update.username]
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }

  async deleteUser(remove: DeleteUserRequest) {
    try {
      await pool.query("DELETE FROM public.users WHERE username = $1", [
        remove.username,
      ]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }
}

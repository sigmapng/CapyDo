import pool from "../database/client.ts";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  LoginUserRequest,
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
    } catch {
      console.error("Failed to get user by username");
    }
  }

  async getUserById(id: string) {
    try {
      const result = await pool.query(
        "SELECT * FROM public.users WHERE id = $1",
        [id]
      );
      return result.rows[0];
    } catch {
      console.error("Failed to get user by id");
    }
  }

  async createUser(create: CreateUserRequest) {
    try {
      await pool.query(
        "INSERT INTO public.users (username, password, firstname) VALUES ($1, $2, $3)",
        [create.username, create.password, create.firstname]
      );
    } catch {
      console.error("Failed to create user");
    }
  }

  async loginUser(login: LoginUserRequest) {
    try {
      await pool.query(
        "SELECT username, password FROM public.users WHERE username = $1",
        [login.username]
      );
    } catch {
      console.error("Failed to login user");
    }
  }

  async changeUserInfo(update: UpdateUserRequest) {
    try {
      await pool.query(
        "UPDATE public.users SET firstname = $1, password = $2 WHERE username = $3",
        [update.firstname, update.password, update.username]
      );
    } catch {
      console.error("Failed to change user info");
    }
  }

  async deleteUser(remove: DeleteUserRequest) {
    try {
      await pool.query("DELETE FROM public.users WHERE username = $1", [
        remove.username,
      ]);
    } catch {
      console.error("Failed to delete user");
    }
  }
}

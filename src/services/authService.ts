import { client } from "../database/client.ts";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../interfaces/user.ts";

export class authService {
  getUserInfo(user: User) {
    client.query(`SELECT * FROM users WHERE username === ${user.userName}`);
  }

  createUser(create: CreateUserRequest) {
    client.query(`
      INSERT INTO users (username, password, name)
      VALUES ${create.userName}, ${create.password}, ${create.firstName}`);
  }

  changeUserInfo(update: UpdateUserRequest) {
    client.query(`
      UPDATE users
      SET ${update.firstName}, ${update.password}, 
      WHERE ${update.userName}`);
  }
}

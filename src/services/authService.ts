import prisma from "../config/database.ts";

export interface User {
  id: number;
  firstname: string;
  username: string;
  password: string;
}

export class authService {
  async getUserInfo(user: Partial<User>) {
    if (user.id) {
      try {
        return await prisma.user.findUnique({
          where: { id: user.id },
        });
      } catch (error: unknown) {
        console.error("An unexpected error occurred:", error);
      }
    } else if (user.username) {
      try {
        return await prisma.user.findUnique({
          where: { username: user.username },
        });
      } catch (error: unknown) {
        console.error("An unexpected error occurred:", error);
      }
    }

    return null;
  }

  async getUserById(userId: number) {
    if (userId) {
      try {
        return await prisma.user.findUnique({
          where: { id: userId },
        });
      } catch (error: unknown) {
        console.error("An unexpected error occurred:", error);
      }
    }

    return null;
  }

  async createUser(user: User) {
    try {
      prisma.user.create({
        data: {
          id: user.id,
          firstname: user.firstname,
          username: user.username,
          password: user.password,
        },
      });
    } catch (error: unknown) {
      console.error("An unexpected error occurred:", error);
    }
  }

  async changeUserInfo(user: Partial<User>) {
    try {
      prisma.user.update({
        where: { id: user.id },
        data: {
          id: user.id,
          firstname: user.firstname,
          username: user.username,
          password: user.password,
        },
      });
    } catch (error: unknown) {
      console.error("An unexpected error occurred:", error);
    }
  }

  async deleteUser(user: Partial<User>) {
    try {
      prisma.user.delete({
        where: { id: user.id },
        select: {
          id: true,
          username: true,
        },
      });
    } catch (error: unknown) {
      console.error("An unexpected error occurred:", error);
    }
  }
}

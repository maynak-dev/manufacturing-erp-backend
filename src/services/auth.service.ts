import bcrypt from "bcryptjs";
import prisma from "../utils/prisma";
import { generateToken } from "../utils/jwt";
import { UserRole } from "@prisma/client";

export class AuthService {
  async register(email: string, password: string, name: string, role?: UserRole) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already exists");

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role: role || "SALES" },
      select: { id: true, email: true, name: true, role: true },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }
    if (!user.isActive) throw new Error("Account is deactivated");

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });
    if (!user) throw new Error("User not found");
    return user;
  }

  async listUsers() {
    return prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateUser(userId: string, data: Partial<{ name: string; role: UserRole; isActive: boolean }>) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      throw new Error("Current password is incorrect");
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { message: "Password updated successfully" };
  }
}

export default new AuthService();

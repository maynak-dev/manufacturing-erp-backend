import { Request, Response } from "express";
import authService from "../services/auth.service";
import { AuthRequest } from "../middleware/auth";

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "email, password, and name are required" });
      }
      const result = await authService.register(email, password, name, role);
      res.status(201).json(result);
    } catch (err: any) {
      const status = err.message === "Email already exists" ? 409 : 500;
      res.status(status).json({ error: err.message || "Registration failed" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
      }
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err: any) {
      const status = err.message === "Invalid credentials" ? 401 : 500;
      res.status(status).json({ error: err.message || "Login failed" });
    }
  }

  async getMe(req: AuthRequest, res: Response) {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json(user);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  async listUsers(req: AuthRequest, res: Response) {
    try {
      const users = await authService.listUsers();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  async updateUser(req: AuthRequest, res: Response) {
    try {
      const user = await authService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to update user" });
    }
  }

  async changePassword(req: AuthRequest, res: Response) {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: "oldPassword and newPassword are required" });
      }
      const result = await authService.changePassword(req.user!.id, oldPassword, newPassword);
      res.json(result);
    } catch (err: any) {
      const status = err.message.includes("incorrect") ? 401 : 500;
      res.status(status).json({ error: err.message || "Failed to change password" });
    }
  }
}

export default new AuthController();

import { Router } from "express";
import authController from "../../controllers/auth.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate, registerSchema, loginSchema } from "../../middleware/validate";
import { authLimiter } from "../../middleware/rateLimiter";

const router = Router();

// Public
router.post("/register", authLimiter, validate(registerSchema), authController.register.bind(authController));
router.post("/login", authLimiter, validate(loginSchema), authController.login.bind(authController));

// Authenticated
router.get("/me", authenticate, authController.getMe.bind(authController));
router.put("/me/password", authenticate, authController.changePassword.bind(authController));

// Admin only
router.get("/users", authenticate, authorize("ADMIN"), authController.listUsers.bind(authController));
router.put("/users/:id", authenticate, authorize("ADMIN"), authController.updateUser.bind(authController));

export default router;

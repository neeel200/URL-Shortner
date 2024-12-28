import { googleAuth } from "../controllers/userController.js";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/google", googleAuth);

export default authRouter;

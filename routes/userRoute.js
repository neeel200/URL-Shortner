import { googleAuth, logOutHandler, redirectUrlCallbackHandler } from "../controllers/userController.js";
import { Router } from "express";

const authRouter = Router();

authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", redirectUrlCallbackHandler);
authRouter.get("/logout", logOutHandler);

export default authRouter;

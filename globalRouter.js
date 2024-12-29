import { Router } from 'express';

const globalRouter = Router();
import authRouter from './routes/userRoute.js';
import analyticsRouter from './routes/analyticsRoute.js';
import urlRouter from './routes/urlRoute.js';
import verifyToken from './middleware/auth.js';

// globalRouter

globalRouter.use("/auth", authRouter);
globalRouter.use("/shorten", urlRouter);
globalRouter.use("/analytics", verifyToken, analyticsRouter);

export default globalRouter;

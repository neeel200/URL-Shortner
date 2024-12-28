import { Router } from 'express';

const globalRouter = Router();
import authRouter from './routes/userRoute.js';
import analyticsRouter from './routes/analyticsRoute.js';
import urlRouter from './routes/urlRoute.js';

// globalRouter

globalRouter.use("/auth", authRouter);
globalRouter.use("/shorten", urlRouter);
globalRouter.use("/analytics", analyticsRouter);

export default globalRouter;

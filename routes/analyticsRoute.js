import { Router } from "express";
import {
  getOverallUrlAnalytics,
  getUrlAnalyticForTopic,
  getUrlAnalyticForAlias,
} from "../controllers/analyticsController.js";
const analyticsRouter = Router();

analyticsRouter.get("/topic/:topic", getUrlAnalyticForTopic);
analyticsRouter.get("/overall", getOverallUrlAnalytics);
analyticsRouter.get("/:alias", getUrlAnalyticForAlias);

export default analyticsRouter;

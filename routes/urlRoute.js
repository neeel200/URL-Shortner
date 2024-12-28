import { Router } from "express";
import {
  getShortenUrl,
  redirectToTheOriginalUrl,
} from "../controllers/urlController.js";
const urlRouter = Router();

urlRouter.post("/", getShortenUrl);
urlRouter.get("/:alias", redirectToTheOriginalUrl);

export default urlRouter;

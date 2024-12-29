import { Router } from "express";
import {
  getShortenUrl,
  redirectToTheOriginalUrl,
} from "../controllers/urlController.js";

import verifyToken from "../middleware/auth.js";

const urlRouter = Router();

urlRouter.post("/", verifyToken, getShortenUrl);
urlRouter.get("/:alias", redirectToTheOriginalUrl);

export default urlRouter;

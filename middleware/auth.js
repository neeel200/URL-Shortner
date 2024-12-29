import jwt from "jsonwebtoken";
import customError from "../utils/customError.js";
import User from "../models/user.js";
import tryCatch from "../utils/tryCatch.js";

const verifyToken = tryCatch(async (req, res, next) => {

  const token = req.cookies["auth_token"];
  if (!token) {
    return next(new customError("Unauthorized", 401));
  }

  // Validate the token
  const verified = await jwt.verify(token, process.env.JWT_SECRET);
  if (!verified) {
    return next(new customError("Invalid token", 403));
  }
  const decoded = await jwt.decode(token);
  const exists = await User.findById(verified.id).lean();
  if (!exists) {
    return next(new customError("User doesnt exists!", 404));
  }
  req.user = decoded;
  next();
});

export default verifyToken;

import express from "express";
import cookieParser from "cookie-parser";
import customError from "./utils/customError.js";
import errorController from "./controllers/errorController.js";
import globalRouter from "./globalRouter.js";
import connectDb from "./DB/config.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path"
import cors from "cors"

// Get the directory name of the current file

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT;
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000', // Allow your front-end domain
  credentials: true,               // Allow credentials like cookies or session
};

app.use(cors(corsOptions));

connectDb();
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// endpoints
app.use("/api",  globalRouter);

// health route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handlers
app.all("*", (req, res, next) => {
  next(new customError(`cant find the ${req.originalUrl}`, 404));
});

app.use(errorController);

app.listen(PORT, () => {
  console.log("Server is listening on port ", PORT);
});

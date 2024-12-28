import express from 'express';
import dotenv from 'dotenv';
import errorController from './controllers/errorController.js';
import globalRouter from './globalRouter.js';

const app = express();
const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: false }));
dotenv.config({ path: ".env" });

// endpoints
app.use("/api", globalRouter)

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

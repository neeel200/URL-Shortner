const express = require("express");
const dotenv = require("dotenv")

const errorController = require("./controllers/errorContrlller");
const app = express();
const PORT = process.env.PORT;
app.use(express.urlencoded({ extended: false }));
dotenv.config({path:".env"})


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

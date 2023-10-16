const express = require("express");
const userRoutes = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const cors = require("cors");
const globalErrorHandler = require("./controllers/errorController");
const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));
// Mount user routes
app.use("/api/users", userRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Cant Find ${req.originalUrl} on this server!`, 404));
});

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

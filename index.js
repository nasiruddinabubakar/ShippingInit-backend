const express = require("express");
const userRoutes = require("./routes/userRoutes");
const orderRoutes=require("./routes/orderRoutes");
const AppError = require("./utils/appError");
const shipRoutes = require("./routes/shipRoutes");
const companyRoutes = require("./routes/companyRoutes");
const cors = require("cors");
const globalErrorHandler = require("./controllers/errorController");
const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));
// Mount user routes
app.use("/api/users", userRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/ships",shipRoutes);
app.use("/api/company",companyRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Cant Find ${req.originalUrl} on this server!`, 404));
});


app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

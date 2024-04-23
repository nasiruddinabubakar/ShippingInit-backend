const express = require("express");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const AppError = require("./utils/appError");
const shipRoutes = require("./routes/shipRoutes");
const companyRoutes = require("./routes/companyRoutes");
const cors = require("cors");
const globalErrorHandler = require("./controllers/errorController");
const con = require("./database/db");
const app = express();

app.use(express.json());
app.use(cors({ origin: ["https://shipping-init.vercel.app", "http://localhost:3000","http://localhost:3001"] }));
//mount user routes
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ships", shipRoutes);
app.use("/api/company", companyRoutes);

app.get('/api/countries',async (req,res)=>{

  const countries = await new Promise((resolve, reject) => {
    con.query(`SELECT start_country AS country
    FROM route
    UNION
    SELECT country
    FROM lag;
    `,(err,result)=>{
      console.log(result);
      if(err) reject(err);
      resolve(result);
    
    })
    // console
  })
  return res.status(200).json({status:'success', countries});
});
app.all("*", (req, res, next) => {
  next(new AppError(`Cant Find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

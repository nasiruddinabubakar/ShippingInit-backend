const express = require("express");
const userRoutes = require("./routes/userRoutes");
const app = express();

app.use(express.json());

// Mount user routes
app.use("/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

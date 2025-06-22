const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Error", err));

app.use("/api", userRoutes);

//post routes
app.use("/api", postRoutes);

//comment routes
app.use("/api", commentRoutes);

module.exports = app;

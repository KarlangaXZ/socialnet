const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const postInteractions = require("./routes/postInteractions");
const socialGraph = require("./routes/socialGraph");
const adminRoutes = require("./routes/adminRoutes");
const isAdmin = require("./middlewares/isAdmin");
const reportRoutes = require("./routes/reportRoutes");
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Error", err));

app.use("/api", userRoutes);

//post routes
app.use("/api", postRoutes);

//post interactions routes
app.use("/api", postInteractions);

//social graph routes
app.use("/api", socialGraph);

//admin routes
app.use("/api", isAdmin, adminRoutes);

//report routes
app.use("/api", reportRoutes);


module.exports = app;

const express = require("express");
const app = express();
const cors = require("cors");

// Import the routes
const routes = require("./routes");

const connectDB = require("./db");

connectDB();

app.use(cors());

app.get("/", (req, res) => {
  res.json("hello");
});

// Mount the routes on the app
app.use("/", routes);

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});

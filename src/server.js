const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");
const interestsRouter = require("./routes/interestsRoutes");
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = process.env.PORT || 8000;
require("dotenv").config();

// app.use(cors());
app.use(
  cors({
    origin: [
      "https://shopzee.onrender.com",
      "http://localhost:3000",
      "http://localhost:5000",
      "https://sz-adminpanel.onrender.com",
    ],
    credentials: true,
  })
);
// app.use(cors({ origin: "http://localhost:3000" }));

const server = http.createServer(app);

const io = socketio(server);
module.exports = io;
require("./app");
app.use(interestsRouter);
app.use("/", (req, res) => {
  res.json("Hello From Express App");
});

// server.listen(PORT, "192.168.0.106", () => {
//   console.log(`SERVER RUNNING ON PORT ${PORT}...`);
// });
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}...`);
});

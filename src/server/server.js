const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");
const interestsRouter = require("../routes/interestsRoutes");
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// app.use(cors({ origin: "http://localhost:3000" }));

const server = http.createServer(app);

const io = socketio(server);
module.exports = io;
require("../app");
app.use(interestsRouter);

server.listen(8000, () => {
  console.log("SERVER RUNNING ON PORT 8000...");
});

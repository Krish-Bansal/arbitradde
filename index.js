const app = require("./app");
const http = require("http");
const hostname = "0.0.0.0";
const mongoose = require("mongoose")
const server = http.createServer(app, (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("zeet Node!");
});
mongoose.set('strictQuery', false);
server.listen(process.env.PORT || 5000, hostname, () => {
  console.log("Backend server is running!" + `http://${hostname}:${5000}`);
});
const app = require("./app");
const http = require("http");
const hostname = "0.0.0.0";

const server = http.createServer(app, (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("zeet Node!");
});
server.listen(process.env.PORT || 5000, hostname, () => {
  console.log("Backend server is running!" + `http://${hostname}:${5000}`);
});
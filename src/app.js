const express = require('express');
const dotenv = require("dotenv");
const app = express();
dotenv.config();
require("./config/db")
const userRoute = require('./routes/userRoutes')
const authoRizeROute = require('./routes/authoRizeRoutes')
const contractRoute = require('./routes/contractRoute');
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use('/api/v1/user', userRoute)
app.use('/api/v1/authorize', authoRizeROute)
app.use('/api/v1/contract', contractRoute)
// Define routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

module.exports = app;

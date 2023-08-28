const express = require('express');
const dotenv = require("dotenv");
const app = express();
dotenv.config();
require("./src/config/db")
const userRoute = require('./src/routes/userRoutes')
const authoRizeROute = require('./src/routes/authoRizeRoutes')
const contractRoute = require('./src/routes/contractRoute');
const cors = require("cors");
const { checkAuth } = require('./src/middleware/checkAdmin');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use('/api/v1/user', userRoute)
app.use('/api/v1/authorize', authoRizeROute)
app.use('/api/v1/contract', contractRoute)
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use('/:contractid/', express.static('public'));
module.exports = app;

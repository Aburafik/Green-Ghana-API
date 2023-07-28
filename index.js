// index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const routes=require('./routes/user');
const app = express();



const PORT = process.env.PORT || 3000;
///MONGOOSE CONFIG
const mongoString = process.env.DATABASE_URL;
mongoose.connect(mongoString);
const database = mongoose.connection;
database.on('error', (error) => {
  console.log(error);
});
database.once('connected', () => {
  console.log('Database Connected Successfully');
});

///MIDDLEWARE
app.use(bodyParser.json());
app.use(cors());

app.use("/api",routes)
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

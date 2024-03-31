const express = require('express');
const http = require("http");
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");

dotenv.config({ path: "./config/config.env" });
connectDB();


const app = express();
const PORT = process.env.PORT;
const server = http.createServer(app);

const patientRouter = require('./routers/patient.router');
const doctorRouter = require('./routers/doctor.router'); 




app.use(bodyParser.json());

app.use('/api/v1/patients', patientRouter);
app.use('/api/v1/doctors', doctorRouter); 




server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
const express = require('express');
const bodyParser = require('body-parser');

const patientRouter = require('./routers/patient.router');
const doctorRouter = require('./routers/doctor.router'); // Importez le routeur des médecins

const app = express();

app.use(bodyParser.json());
app.use('/', patientRouter);
app.use('/', doctorRouter); // Utilisez le routeur des médecins

module.exports = app;
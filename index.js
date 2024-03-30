const app = require('./app');
const db = require('./config/db');
const PatientModel = require('./model/patient.model');
const DoctorModel = require('./model/doctor.model'); 
const UserModel= require('./model/user.model');

const port = 3000;

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`);
});
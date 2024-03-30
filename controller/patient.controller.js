const PatientService = require("../services/patient.services");
const PatientModel = require("../model/patient.model");
const UserService = require("../services/user.services"); // Import UserService

exports.register = async (req, res, next) => {
    try {
       
        const existingPatient = await PatientModel.findOne({ email: req.body.email });
        if (existingPatient) {
           
            return res.status(400).json({ error: 'Email address already in use' });
        }

        
        const { firstName, lastName, email, password, birthdate, city, address, phoneNumber, nationalID, weight, height, bloodType, diseases, appointments } = req.body;
        const successRes = await PatientService.registerPatient(firstName, lastName, email, password, birthdate, city, address, phoneNumber, nationalID, weight, height, bloodType, diseases, appointments);

      
        const user = await UserService.registerUser(email, password, 'patient');

        res.json({ status: true, success: "Patient Registered Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
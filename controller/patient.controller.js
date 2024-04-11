
const PatientModel = require("../model/patient.model");
const UserModel = require("../model/user.model");

exports.register = async (req, res, next) => {
    try {
        const {firstName, lastName, email, password, birthdate, city, address, phoneNumber, nationalID, weight, height, bloodType, diseases, appointments}=req.body;

        const existingPatient = await PatientModel.findOne({ email: req.body.email });
        if (existingPatient) {
           
            return res.status(400).json({ error: 'Email address already in use' });
        }

        
        const patient = new PatientModel({firstName, lastName, email, password, birthdate, city, address, phoneNumber, nationalID, weight, height, bloodType, diseases, appointments });
        await patient.save();

        const  user = new UserModel({email, password, role:'patient'})
        await  user.save();

        res.json({ status: true, success: "Patient Registered Successfully" });
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getPatients = async (req, res, next) =>{
    return res.json({ status: true, data: "Patients successfully" });
 }
 
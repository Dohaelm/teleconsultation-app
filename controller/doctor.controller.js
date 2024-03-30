const DoctorService = require("../services/doctor.services");
const UserService = require('../services/user.services');
const DoctorModel = require('../model/doctor.model');

exports.registerDoctor = async (req, res, next) => {
    try {
        
        const { firstName, lastName, email, password, birthdate, city, address, phoneNumber, nationalID, schedule, specialization, experience, hospitalAffiliation, additionalInfo, appointments } = req.body;

        const existingDoctor = await DoctorModel.findOne({ email });
        if (existingDoctor) {
            
            return res.status(400).json({ error: 'Email address already in use' });
        }

       
        const successRes = await DoctorService.registerDoctor(firstName, lastName, email, password, birthdate, city, address, phoneNumber, nationalID, schedule, specialization, experience, hospitalAffiliation, additionalInfo, appointments);
        
        
        const user = await UserService.registerUser(email, password, 'doctor');
       
        res.json({ status: true, success: "Doctor registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

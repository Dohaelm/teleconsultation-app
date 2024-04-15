const UserModel = require('../model/user.model');
const DoctorModel = require('../model/doctor.model');
const{body,validationResult}=require('express-validator');

exports.registerDoctor = async (req, res, next) => {
    try {
        
        const { firstName, lastName, email, password, birthdate, city, address, phoneNumber, nationalID, schedule, specialization, experience, hospitalAffiliation, additionalInfo, appointments } = req.body;

        const existingDoctor = await DoctorModel.findOne({ email });
        if (existingDoctor) {
            
            return res.status(400).json({ error: 'Email address already in use' });
        }

       
        const doc = new DoctorModel({firstName, lastName, email, password, birthdate, city, address, phoneNumber, nationalID, schedule, specialization, experience, hospitalAffiliation, additionalInfo, appointments});
        await doc.save();
        const  user = new UserModel({email, password, role:'doctor'})
        await user.save();
   
       
        return res.json({ status: true, success: "Doctor registered successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};



exports.getDocs = async (req, res, next) =>{
   return res.json({ status: true, data: "Doctor  successfully" });
}


const PatientModel = require("../model/patient.model");
const UserModel = require("../model/user.model");
const{body,validationResult}=require('express-validator');

exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            errors.array().forEach(error => {
                req.flash('error',error.msg)
            });
           res.render('register',{email: req.body.email,
        messages:req.flash()})
           return;
        }
        const {firstName, lastName, email, password, birthdate, city, address, phoneNumber, nationalID, weight, height, bloodType, diseases, appointments}=req.body;

        const existingPatient = await PatientModel.findOne({ email: req.body.email });
        if (existingPatient) {
            
            req.flash('warning','existing email sign in')

            
          
           
            res.redirect('/user/login');
            return;
        }

        
        const patient = new PatientModel({firstName, lastName, email, password, birthdate, city, address, phoneNumber, nationalID, weight, height, bloodType, diseases, appointments });
        await patient.save();

        const  user = new UserModel({email, password, role:'patient'})
        await  user.save();
        req.flash('success',`${patient.email} registered successfully`)
       res.redirect('/user/login')
        // res.send(user);
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getPatients = async (req, res, next) =>{
    return res.json({ status: true, data: "Patients successfully" });
 }
 
const router = require('express').Router();
const Patient=require('../models/patient.model')
const User=require('../models/user.model')
const Doctor=require('../models/doctor.model')
const { roles } = require('../utils/constants');
const { ensureLoggedOut, ensureLoggedIn } = require('connect-ensure-login');
router.get('/profile', async (req, res) => {
  try {
    let patient=null;
    let doctor=null;
    let condition1=null;
    let condition2=null;
    
    // Assuming you have retrieved the user data from the database
    const person = await User.findOne({ email: req.user.email });
    if(person.id===req.user.id){
      condition1=true;
    }

    // Check if the user has the 'patient' role
    if (person.role === roles.patient) {
      // Assuming you have retrieved the patient data from the database
       patient = await Patient.findOne({ email: req.user.email });
     
      
      // Render the profile page and pass user and patient data to the template
     
    }
    // Check if the user has the 'doctor' role
     if (person.role === roles.doctor) {
      // Assuming you have retrieved the doctor data from the database
       doctor = await Doctor.findOne({ email: req.user.email });

      // Render the profile page and pass user and doctor data to the template
    
    }
    
    // If the user is neither a patient nor a doctor, render the profile page with only user data
    return res.render('profile', {person, doctor,patient,condition1,condition2 });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/edit-profile',async(req,res)=>{
  try{ 
    let patient=null;
    let doctor=null;
    let condition1=null;
    let condition2=null;
    
    
    // Assuming you have retrieved the user data from the database
    const person = await User.findOne({ email: req.user.email });
    
    if(person.id===req.user.id){
      condition1=true;
    }
    // Check if the user has the 'patient' role
    if (person.role === roles.patient) {
      // Assuming you have retrieved the patient data from the database
       patient = await Patient.findOne({ email: req.user.email });
     
      
      // Render the profile page and pass user and patient data to the template
   ;
    }
    // Check if the user has the 'doctor' role
     if (person.role === roles.doctor) {
      // Assuming you have retrieved the doctor data from the database
        doctor = await Doctor.findOne({ email: req.user.email });

      // Render the profile page and pass user and doctor data to the template
      
    }
    
    // If the user is neither a patient nor a doctor, render the profile page with only user data
    res.render('edit-profile', { person,patient,doctor,condition1,condition2 });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/save',async(req,res)=>{
  try{ 
    
    let patient=null;
    let doctor=null
    const {firstName,lastName,email}=req.body;
    // Assuming you have retrieved the user data from the database
    const person = await User.findOneAndUpdate({ email},{
      firstName,
      lastName
    }); 
    console.log(req.body);
    person.save();
    

    // Check if the user has the 'patient' role
    if (person.role === roles.patient) {
      // Assuming you have retrieved the patient data from the database
       
     
     patient= await Patient.findOne({email})
     patient.firstName=req.body.firstName
      patient.lastName=req.body.lastName
      patient.birthdate=req.body.birthdate
      patient.city=req.body.city
      patient.weight=req.body.weight
      patient.height=req.body.height
      patient.bloodType=req.body.bloodType
     console.log(patient)
     patient.save();
      
    }
    // Check if the user has the 'doctor' role
     if (person.role === roles.doctor) {
      doctor= await Doctor.findOne({email})
      doctor.firstName=req.body.firstName
        doctor.lastName=req.body.lastName
        doctor.city=req.body.city
        doctor.specialization=req.body.specialization
        doctor.experience=req.body.experience
        console.log(doctor)
doctor.save();

    }
    req.flash('success','changes successfully saved');
    req.session.person = person;
req.session.patient = patient;
req.session.doctor = doctor;
if(req.user.role===roles.admin){
return res.redirect(`/admin/user/${person.id}`);}
else{
  res.redirect('/user/profile');
}
   
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

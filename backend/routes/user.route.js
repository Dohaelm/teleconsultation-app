const router = require('express').Router();
const Patient=require('../models/patient.model')
const User=require('../models/user.model')
const Doctor=require('../models/doctor.model')
const { roles } = require('../utils/constants');
const { ensureLoggedOut, ensureLoggedIn } = require('connect-ensure-login');
router.get('/profile', async (req, res) => {
  try {
    let patient=null;
    // Assuming you have retrieved the user data from the database
    const user = await User.findOne({ email: req.user.email });
    

    // Check if the user has the 'patient' role
    if (user.role === roles.patient) {
      // Assuming you have retrieved the patient data from the database
       patient = await Patient.findOne({ email: req.user.email });
     
      
      // Render the profile page and pass user and patient data to the template
      return res.render('profile', { user, patient });
    }
    // Check if the user has the 'doctor' role
     if (user.role === roles.doctor) {
      // Assuming you have retrieved the doctor data from the database
       const doctor = await Doctor.findOne({ email: req.user.email });

      // Render the profile page and pass user and doctor data to the template
      return res.render('profile', { user, doctor,patient });
    }
    
    // If the user is neither a patient nor a doctor, render the profile page with only user data
    res.render('profile', { user });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/edit-profile',async(req,res)=>{
  try{ 
    let patient=null;
    
    // Assuming you have retrieved the user data from the database
    const user = await User.findOne({ email: req.user.email });
    

    // Check if the user has the 'patient' role
    if (user.role === roles.patient) {
      // Assuming you have retrieved the patient data from the database
       patient = await Patient.findOne({ email: req.user.email });
     
      
      // Render the profile page and pass user and patient data to the template
      return res.render('edit-profile', { user, patient });
    }
    // Check if the user has the 'doctor' role
     if (user.role === roles.doctor) {
      // Assuming you have retrieved the doctor data from the database
       const doctor = await Doctor.findOne({ email: req.user.email });

      // Render the profile page and pass user and doctor data to the template
      return res.render('edit-profile', { user, doctor,patient });
    }
    
    // If the user is neither a patient nor a doctor, render the profile page with only user data
    res.render('edit-profile', { user });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/save',async (req, res,next) => {
  try {
    const { email, role } = req.user; // Assuming req.user contains the user's data including the email and role
    let updatedFields;

    // Check the user's role
    if (role === roles.patient) {
      // For patients, update the specific fields related to patient profile
      updatedFields = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthdate:req.body.birthdate,
        city:req.body.city,
        weight: req.body.weight,
        height: req.body.height,
        bloodType: req.body.bloodType

        
        // Add other patient-specific fields here
      };

      // Find the patient by email
      const patient = await Patient.findOne({ email });

      // Update the patient object with the new data
      Object.assign(patient, updatedFields);

      // Save the updated patient object
      await patient.save();
    } else if (role===roles.doctor){
      // For other roles, update the basic fields (first name, last name, email, etc.)
      updatedFields = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        city:req.body.city,
       specialization:req.body.specialization

        // Add other common fields here
      };
      

      // Find the user by email
      const doctor= await Doctor.findOne({ email });

      // Update the user object with the new data
      Object.assign(doctor, updatedFields);

      // Save the updated user object
      await doctor.save();
    }
    else{
      updatedFields={
        firstName:req.body.firstName,
        lastName:req.body.lastName

      }
    }

    // Redirect back to the profile page with a success message
    req.flash('success', 'Profile updated successfully');
    res.redirect('/profile');
  } catch (error) {
    // Handle errors
    next(error);
    req.flash('error', 'Failed to update profile');
    res.redirect('/profile');
  }
});
module.exports = router;

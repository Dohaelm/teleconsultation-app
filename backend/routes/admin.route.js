const User = require('../models/user.model');
const Doctor=require('../models/doctor.model');
const Patient=require('../models/patient.model');
const router = require('express').Router();
const mongoose = require('mongoose');
const { roles } = require('../utils/constants');

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    // res.send(users);
    res.render('manage-users', { users });
  } catch (error) {
    next(error);
  }
});

router.get('/user/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    let condition1=null;
    let condition2=null;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      res.redirect('/admin/users');
      return;
    }
    
    const person=await User.findById(id);
    if (req.user.role===roles.admin){
      condition2=true;
    }
    

    let doctor=null;
    let patient=null;
    if (person.role===roles.doctor){
      doctor= await Doctor.findOne({email:person.email})

    }
    else if(person.role===roles.patient){
      patient= await Patient.findOne({email:person.email})
    }
    res.render('profile', { person , patient, doctor,condition1,condition2});
  } catch (error) {
    next(error);
  }
});

router.post('/update-role', async (req, res, next) => {
  try {
    const { id, role } = req.body;

    // Checking for id and roles in req.body
    if (!id || !role) {
      req.flash('error', 'Invalid request');
      return res.redirect('back');
    }

    // Check for valid mongoose objectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      return res.redirect('back');
    }

    // Check for Valid role
    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('back');
    }

    // Admin cannot remove himself/herself as an admin
    if (req.user.id === id && role !== roles.admin) {
      req.flash(
        'error',
        'Admins cannot remove themselves from Admin, ask another admin.'
      );
      return res.redirect('back');
    }

    // Fetch user details
    const person = await User.findById(id);

    if (!person) {
      req.flash('error', 'User not found');
      return res.redirect('back');
    }

    // Update user's role
    person.role = role;

    // Handle scenarios based on the updated role
    switch (role) {
      case roles.admin:
        // If the role is updated to admin, remove user from Doctor or Patient model if exists
        await Doctor.findOneAndDelete({ email: person.email });
        await Patient.findOneAndDelete({ email: person.email });
        break;
      case roles.doctor:
        // If the role is updated to doctor, remove user from Patient model if exists
        await Patient.findOneAndDelete({ email: person.email });
        // Create new Doctor model with user details
        await Doctor.create({
          firstName: person.firstName,
          lastName: person.lastName,
          email: person.email,
          password: person.password,
          birthdate:null,
        
        city: null,
        address: null,
        phoneNumber: null,
        nationalID: null,
        schedule: null,
        specialization:null,
        experience: null,
        hospitalAffiliation:null,
        additionalInfo: null,
        appointments: null // Ensure password is hashed
          // Add other necessary fields for Doctor model initialization
        });
        break;
      case roles.patient:
        // If the role is updated to patient, remove user from Doctor model if exists
        await Doctor.findOneAndDelete({ email: person.email });
        // Create new Patient model with user details
        await Patient.create({
          firstName: person.firstName,
          lastName: person.lastName,
          email:person.email,
          password: person.password, 
          birthdate: null,
          city: null,
          address: null,
          phoneNumber: null,
          nationalID: null,
          weight: null,
          height: null,
          bloodType: null,
          diseases: null,
          appointments: null,
        });
        break;
      default:
        break;
    }

    // Save updated user details
    await person.save();

    req.flash('info', `Updated role for ${person.email} to ${role}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});
router.post('/delete-user', async (req, res, next) => {
  try {
    const userId = req.body.id; // Assuming you're sending the user ID in the request body
    // Use Mongoose to find and delete the user by ID
    const person = await User.findByIdAndDelete(userId);
    req.flash('success', `user ${person.email} deleted`);
    res.redirect('back');
  } catch (error) {
    // Handle any errors
    next(error);
  }
});
router.get('/edit-profile-user/:id', async (req, res, next) => {
  try {
    const {id}  = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      res.redirect('/admin/users');
       return;
     }
    const person = await User.findById(id);
    console.log(req.body) ;
    console.log(person);
    let doctor=null;
    let patient=null;
    let condition1=null;
    let condition2=null;
    if(req.user.role===roles.admin){
      condition2=true;
    }
    if (person.role===roles.doctor){
      doctor= await Doctor.findOne({email:person.email})
      console.log(doctor)

    }
    else if(person.role===roles.patient){
      patient= await Patient.findOne({email:person.email})
      console.log(patient)
    }
   
    res.render('edit-profile', { person , patient, doctor,condition1,condition2});
  } catch (error) {
    next(error);
  }
});

module.exports = router;

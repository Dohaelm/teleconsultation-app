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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      res.redirect('/admin/users');
      return;
    }
    const person = await User.findById(id);
    res.render('profile', { person });
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
    const user = await User.findById(id);

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('back');
    }

    // Update user's role
    user.role = role;

    // Handle scenarios based on the updated role
    switch (role) {
      case roles.admin:
        // If the role is updated to admin, remove user from Doctor or Patient model if exists
        await Doctor.findOneAndDelete({ email: user.email });
        await Patient.findOneAndDelete({ email: user.email });
        break;
      case roles.doctor:
        // If the role is updated to doctor, remove user from Patient model if exists
        await Patient.findOneAndDelete({ email: user.email });
        // Create new Doctor model with user details
        await Doctor.create({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
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
        await Doctor.findOneAndDelete({ email: user.email });
        // Create new Patient model with user details
        await Patient.create({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password, 
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
    await user.save();

    req.flash('info', `Updated role for ${user.email} to ${role}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});
router.post('/delete-user', async (req, res, next) => {
  try {
    const userId = req.body.id; // Assuming you're sending the user ID in the request body
    // Use Mongoose to find and delete the user by ID
    const user = await User.findByIdAndDelete(userId);
    req.flash('success', `user ${user.email} deleted`);
    res.redirect('back');
  } catch (error) {
    // Handle any errors
    next(error);
  }
});
router.post('/profile/edit', async (req, res,next) => {
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

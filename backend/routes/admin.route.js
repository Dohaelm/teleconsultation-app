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
    let condition3=null;
    let condition4=null;
    let sortedAvailability=[];
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
      const daysOfWeekOrder = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

      // Sort the availability array based on the order of daysOfWeekOrder
         sortedAvailability = doctor.availability.sort((a, b) => {
          return daysOfWeekOrder.indexOf(a.dayOfWeek) - daysOfWeekOrder.indexOf(b.dayOfWeek);
      });

    }
    else if(person.role===roles.patient){
      patient= await Patient.findOne({email:person.email})
      if(patient.birthdate){
        condition4=true
      }
    }
    console.log(doctor)
    res.render('profile', { person , patient, doctor,condition1,condition2,condition3,sortedAvailability,condition4});
  } catch (error) {
    next(error);
  }
});

router.post('/update-role', async (req, res, next) => {
  try {
    const { id, role } = req.body;

    if (!id || !role) {
      req.flash('error', 'Invalid request');
      return res.redirect('back');
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      return res.redirect('back');
    }

    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash('error', 'Role invalide');
      return res.redirect('back');
    }

    if (req.user.id === id && role !== roles.admin) {
      req.flash('error', 'Un Admin ne peut pas changer son propre role.');
      return res.redirect('back');
    }

    const person = await User.findById(id);

    if (!person) {
      req.flash('error', 'Utilisateur introuvable.');
      return res.redirect('back');
    }
    if (person.role === role) {
      req.flash('warning', `l'utilisateur est déja un ${role}`);
      return res.redirect('back');
    }

    person.role = role;

    switch (role) {
      case roles.admin:
        await Doctor.findOneAndDelete({ email: person.email });
        await Patient.findOneAndDelete({ email: person.email });
        break;
      case roles.doctor:
        await Patient.findOneAndDelete({ email: person.email });
        await Doctor.create({
          _id: person._id,
          firstName: person.firstName,
          lastName: person.lastName,
          email: person.email,
          password: person.password,
          birthdate: null,
          city: null,
          address: null,
          phoneNumber: null,
          nationalID: null,
          availability: [], // or other appropriate default values
          specialization: null,
          experience: null,
          hospitalAffiliation: null,
          additionalInfo: [],
          appointments: [],
          pendingAppointments: [],
          availabilitytimeslots: []
        });
        break;
      case roles.patient:
        await Doctor.findOneAndDelete({ email: person.email });
        await Patient.create({
          _id: person._id,
          firstName: person.firstName,
          lastName: person.lastName,
          email: person.email,
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
          appointments: [],
          pendingAppointments: []
        });
        break;
      case roles.attente:
        await Doctor.findOneAndDelete({ email: person.email });
        await Patient.findOneAndDelete({ email: person.email });
        break;
      default:
        break;
    }

    await person.save();

    req.flash('info', `${role} a été attribué à ${person.email}  `);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

router.post('/delete-user', async (req, res, next) => {
  try {
    const userId = req.body.id; 
    if (req.user.id===req.body.id){
      req.flash('warning', `Admin ne peut pas supprimer son compte`);
      return res.redirect('back')
    }
    const person = await User.findByIdAndDelete(userId);
    if(person.role===roles.patient){
      await Patient.findOneAndDelete({email:person.email})
    }
    if(person.role===roles.doctor){
      await Doctor.findOneAndDelete({email:person.email})
    }
    req.flash('success', `utilisateur ${person.email} supprimé`);
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
      req.flash('error', 'Id Invalide');
      res.redirect('/admin/users');
       return;
     }
    const person = await User.findById(id);
   
    let doctor=null;
    let patient=null;
    let condition1=null;
    let condition2=null;
    let condition4=null;
    let sortedAvailability=[];
    if(req.user.role===roles.admin){
      condition2=true;
    }
    if (person.role===roles.doctor){
      doctor= await Doctor.findOne({email:person.email})
      const daysOfWeekOrder = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Sort the availability array based on the order of daysOfWeekOrder
   sortedAvailability = doctor.availability.sort((a, b) => {
    return daysOfWeekOrder.indexOf(a.dayOfWeek) - daysOfWeekOrder.indexOf(b.dayOfWeek);
});
    }
    else if(person.role===roles.patient){
      patient= await Patient.findOne({email:person.email})
      if(patient.birthdate){
        condition4=true;
      }
      
    }
   
    res.render('edit-profile', { person , patient, doctor,condition1,condition2,sortedAvailability,condition4});
  } catch (error) {
    next(error);
  }
});

module.exports = router;
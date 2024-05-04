const router = require('express').Router();
const { ObjectId } = require('mongodb');
const Patient=require('../models/patient.model')
const User=require('../models/user.model')
const mongoose = require('mongoose');
const Doctor=require('../models/doctor.model')
const { roles } = require('../utils/constants');
const { ensureLoggedOut, ensureLoggedIn } = require('connect-ensure-login');
router.get('/profile', async (req, res) => {
  try {
    let patient=null;
    let doctor=null;
    let condition1=true;
    let condition2=null;
    let condition3=null;
    const person= await User.findOne({ email: req.user.email })
  
    
    // Assuming you have retrieved the user data from the database
   

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
    
    
    return res.render('profile', {person, doctor,patient,condition1,condition2,condition3 });
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
     
     patient.save();
      
    }
    // Check if the user has the 'doctor' role
     if (person.role === roles.doctor) {
       doctor= await Doctor.findOne({email})
       const availability = doctor.availability;
      doctor.firstName=req.body.firstName
        doctor.lastName=req.body.lastName
        doctor.city=req.body.city
        doctor.specialization=req.body.specialization
        doctor.experience=req.body.experience
         const daysOfWeek=req.body.daysOfweekArray
        const startTimes=req.body.startTimesArray
        const endTimes=req.body.endTimesArray
        console.log(req.body)
      
        
        if (Array.isArray(daysOfWeek) && Array.isArray(startTimes) && Array.isArray(endTimes) ) {
          // Iterate over each selected day/time slot combination
          for (let i = 0; i < daysOfWeek.length; i++) {
            // Create a new availability object with the selected day, start time, and end time
            const availabilityObj = {
              dayOfWeek: daysOfWeek[i],
              startTime: startTimes[i],
              endTime:endTimes[i],
               // Initially set to null
            };
        
            // Push the availability object to the availability array
            availability.push(availabilityObj);
            
           
          }
        }
        doctor.availability = availability;
        
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
router.post('/delete-slot', async (req, res, next) => {
  try { 
    
    const doctor= await Doctor.findOne({email:req.body.id})
   
      const slotId = req.body.slotId;
      console.log(doctor.availability[0]._id)
      console.log(slotId)
      
      // Retrieve slot ID from the request body

      // Find the slot object in the doctor's availability array by its ID
       let slotIndex;
       for(i=0;i<doctor.availability.length;i++){
        if (doctor.availability[i]._id===slotId){
          slotIndex=i;
        }

       }
      // // If the slot is found
       if (slotIndex !== -1) {
      //     // Remove the slot object from the availability array
       doctor.availability.splice(slotIndex, 1);

      //     // Save the changes to the database
          await doctor.save();
          console.log(doctor.availability)

      //     // Respond with a success message
         req.flash('success','Slot deleted successfully.');
         return res.redirect('back')

       } else {
           // If the slot is not found, respond with a 404 Not Found error
           return res.status(404).send('Slot not found.');
       }
  } catch (error) {
      // If an error occurs, pass it to the error handling middleware
      return next(error);
  }
});

router.get('/doctors', async (req, res, next) => {
  try {
   let doctors= await Doctor.find();
   
   if (req.query.search) {
    const searchQuery = req.query.search.toLowerCase();
    doctors = doctors.filter(doctor => 
        doctor.lastName.toLowerCase().includes(searchQuery) ||
        doctor.firstName.toLowerCase().includes(searchQuery)||
        (doctor.firstName.toLowerCase() + ' ' + doctor.lastName.toLowerCase()).includes(searchQuery) || 
         doctor.specialization.toLowerCase().includes(searchQuery) ||
        doctor.city.toLowerCase().includes(searchQuery)
    );
}
    
    res.render('doctors', { 
        doctors
    });
} catch (error) {
    next(error);
}
});

router.get('/booking/:id',async(req,res,next)=>{
  try { 
      const {id}=req.params;
      const patient= await Patient.findOne({email:req.user.email});
      const doctor = await Doctor.findOne({_id:id})
     console.log(doctor.email)
  
    return res.render('booking', {patient,doctor})
    
  } catch (error) {
    next(error)
  }
  });
router.get('/appointments',async(req,res,next)=>{
  try {
   
    const person=await User.findOne({email:req.user.email});
    
    let doctor=null;
    let patient=null;
    let condition1=null;
    let condition2=null;
   
    
    if(person.role===roles.patient){
      patient= await Patient.findOne({email:req.user.email})
      
      
      condition1=true;
      
    }
     
   
    if(person.role===roles.doctor){
     doctor= await Doctor.findOne({email:req.user.email})
   
     condition2=true;
    }
    
    return res.render('appointments',{doctor,patient,condition1,condition2})
  } catch (error) {
    next(error)
  }
})
function formatTime(date) {
  const hour = String(date.getHours()).padStart(2, '0'); // Ensure 2-digit format
  const minutes = String(date.getMinutes()).padStart(2, '0'); // Ensure 2-digit format
  return `${hour}:${minutes}`;
}
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function generateUniqueId() {
  return new ObjectId().toHexString();
}

router.post('/book-appointment',async(req,res,next)=>{
  try {
    console.log(req.body)
  
    const appDate = new Date(req.body.date);
  const reason=req.body.reason;
  const additInfo=req.body.additionalInfo;
  const doctorEmail=req.body.doctorEmail
  const patientEmail=req.body.patientEmail
  const doctor= await Doctor.findOne({email:req.body.doctorEmail})
  const patient= await Patient.findOne({email: req.body.patientEmail})
  let isAvailable=true;
  const appointmentId = generateUniqueId();

 

   doctor.appointments.forEach(appointment => {
    // Calculate the absolute time difference between appDate and appointmentDate
    const timeDifference = Math.abs(appDate.getTime() - appointment.appointmentDate.getTime());

    // Check if the time difference is less than 30 minutes
    if( timeDifference <(30 * 60 * 1000)){
      isAvailable=false;
      

    }
     
})

console.log(isAvailable)
  const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const dayofApp=daysOfWeek[appDate.getDay()]
  const availabilityEntry = doctor.availability.find(entry => entry.dayOfWeek === dayofApp);
  if (!availabilityEntry) {
    req.flash('warning','Veuillez choisir un autre jour'); 
    return res.redirect('back') 
}
const dayStart=timeToMinutes(availabilityEntry.startTime) 
const dayEnd=timeToMinutes(availabilityEntry.endTime) 
const timeApp=timeToMinutes(formatTime(appDate))
if(isAvailable && timeApp<dayEnd && timeApp>dayStart ){
  doctor.pendingAppointments.push({ _id:appointmentId,patientEmail: patientEmail,
    appointmentDate: appDate,
    reason: reason})
  doctor.save();
  patient.pendingAppointments.push({_id:appointmentId, doctorEmail: doctorEmail,
    appointmentDate: appDate,
    reason: reason})
  patient.save();
  req.flash('success','Votre demande est en cours de traitement')
  console.log(patient.pendingAppointments)
  console.log(doctor.pendingAppointments)
  console.log(appDate)
  return res.redirect('/');

} 
else{
  req.flash('error', 'Horaire non disponible')
  return res.redirect('back')
}
} catch (error) {
  next(error) 
    
}
})
router.post('/delete-app',async(req,res,next)=>{
  console.log(req.body)
  const id=req.body.appId;
  
  const doctor= await Doctor.findOne({email:req.body.doctorEmail})
  const patient= await Patient.findOne({email:req.body.patientEmail})
  try {
    let indexd;
    let indexp;
    for(i=0;i<doctor.pendingAppointments.length;i++){
     if (doctor.pendingAppointments[i]._id===id){
       indexd=i;
     }

    }
    for(i=0;i<patient.pendingAppointments.length;i++){
     if (patient.pendingAppointments[i]._id===id){
       indexp=i;
     }

    }
   // // If the slot is found
    if (indexp !== -1 && indexd!==-1) {
   //     // Remove the slot object from the availability array
    patient.pendingAppointments.splice(indexp, 1);
    patient.save();
    console.log(patient.pendingAppointments)
    doctor.pendingAppointments.splice(indexd, 1);
    doctor.save();
    console.log(doctor.pendingAppointments)
    req.flash('success','appointment deleted')
  }
  else{
    req.flash('error','an error is detected')
  
  }
  return res.redirect('back');
}
  catch (error) {
    next(error);
  }
})

router.post('/accept-app',async(req,res,next)=>{
  console.log(req.body)
  const id=req.body.appId;
  
  const doctor= await Doctor.findOne({email:req.body.doctorEmail})
  const patient= await Patient.findOne({email:req.body.patientEmail})
  
  try {
    let indexd;
    let indexp;
  
    for(i=0;i<doctor.pendingAppointments.length;i++){
      console.log(doctor.pendingAppointments[i])
      if (doctor.pendingAppointments[i]._id==id){
        indexd=i;
        
     }

     }
     for(i=0;i<patient.pendingAppointments.length;i++){
      console.log(patient.pendingAppointments[i])
     if (patient.pendingAppointments[i]._id==id){
    
        indexp=i;
// 
    }
  }


  

   if (indexp !== -1 && indexd!==-1) {

     patient.appointments.push(patient.pendingAppointments[indexp]);
     patient.pendingAppointments.splice(indexp, 1);
        patient.save();
        doctor.appointments.push(doctor.pendingAppointments[indexd]);
        doctor.pendingAppointments.splice(indexd, 1);
      doctor.save();
      
      
    
      req.flash('success','appointment accepted')
     }
   else{
    req.flash('error','an error is detected')
  
    }
   return res.redirect('back');
}
   catch (error) {
   next(error);
   }
})
router.get('/patient/:email', async (req, res, next) => {
  try {
    const { email } = req.params;
    let condition1=null;
    let condition2=null;
    let condition3=null;
    
   
   
    const person=await User.findOne({email:email});
    
    
    if(req.user.email===person.email){
      condition1=true;
    } 
    if(req.user.role===roles.patient){
      condition3=true;
    }
    console.log(req.user.email===person.email)
  
    if(req.user.role===roles.admin){
      condition2=true
    }
    

    let doctor=null;
    let patient=null;
    if (person.role===roles.patient){
      patient= await Patient.findOne({email:person.email})

    }
    
   return res.render('profile', { person , patient, doctor,condition1,condition2,condition3});
  } catch (error) {
    next(error);
  }
});
router.get('/doctor/:email', async (req, res, next) => {
  try {
    
    const { email } = req.params;
    
    let condition1=null;
    let condition2=null;
    let condition3=null;
    
  
   
    const person=await User.findOne({email:email});
    
    
    if(req.user.email===person.email){
      condition1=true;
    } 
    if(req.user.role===roles.patient){
      condition3=true;
    }
    console.log(req.user.email===person.email)
  
    if(req.user.role===roles.admin){
      condition2=true
    }
    

    let doctor=null;
    let patient=null;
    if (person.role===roles.doctor){
      doctor= await Doctor.findOne({email:person.email})

    }
    
   return res.render('profile', { person , patient, doctor,condition1,condition2,condition3});
  } catch (error) {
    next(error);
  }
});
module.exports = router;
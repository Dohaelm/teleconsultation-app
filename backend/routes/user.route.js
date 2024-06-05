const router = require('express').Router();
const { ObjectId } = require('mongodb');
const Patient=require('../models/patient.model')
const User=require('../models/user.model')
const mongoose = require('mongoose');
const Doctor=require('../models/doctor.model')
const { roles } = require('../utils/constants');
const { ensureLoggedOut, ensureLoggedIn } = require('connect-ensure-login');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
router.get('/profile', async (req, res) => {
  try {
    let patient=null;
    let doctor=null;
    let condition1=true;
    let condition2=null;
    let condition3=null;
    let sortedAvailability=[];
    let condition4=null;
    
    const person= await User.findOne({ email: req.user.email })
  
  
    // Assuming you have retrieved the user data from the database
   

    // Check if the user has the 'patient' role
    if (person.role === roles.patient) {
      // Assuming you have retrieved the patient data from the database
       patient = await Patient.findOne({ email: req.user.email });
       patient.setAllAppointmentsAbsent();
       await patient.save();
       if(patient.birthdate){
        condition4=true;

       }
    
      
      // Render the profile page and pass user and patient data to the template
     
    }
    // Check if the user has the 'doctor' role
     if (person.role === roles.doctor) {
      // Assuming you have retrieved the doctor data from the database
       doctor = await Doctor.findOne({ email: req.user.email });
       doctor.setAllAppointmentsAbsent();
       await doctor.save();
       const daysOfWeekOrder = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Sort the availability array based on the order of daysOfWeekOrder
   sortedAvailability = doctor.availability.sort((a, b) => {
    return daysOfWeekOrder.indexOf(a.dayOfWeek) - daysOfWeekOrder.indexOf(b.dayOfWeek);
});

// 
    
    }
    
   
    return res.render('profile', {person, doctor,patient,condition1,condition2,condition3,sortedAvailability,condition4});
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
   let sortedAvailability=[];
    let condition4=null
    
    // Assuming you have retrieved the user data from the database
    const person = await User.findOne({ email: req.user.email });
    
    if(person.id===req.user.id){
      condition1=true;
    }
    // Check if the user has the 'patient' role
    if (person.role === roles.patient) {
      // Assuming you have retrieved the patient data from the database
       patient = await Patient.findOne({ email: req.user.email });
       if(patient.birthdate){
        condition4=true;
       }
      
      
      // Render the profile page and pass user and patient data to the template
   ;
    }
    // Check if the user has the 'doctor' role
     if (person.role === roles.doctor) {
      // Assuming you have retrieved the doctor data from the database
        doctor = await Doctor.findOne({ email: req.user.email });
        const daysOfWeekOrder = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Sort the availability array based on the order of daysOfWeekOrder
   sortedAvailability = doctor.availability.sort((a, b) => {
    return daysOfWeekOrder.indexOf(a.dayOfWeek) - daysOfWeekOrder.indexOf(b.dayOfWeek);
});
        
      // Render the profile page and pass user and doctor data to the template
      
    }
    
    // If the user is neither a patient nor a doctor, render the profile page with only user data
    res.render('edit-profile', { person,patient,doctor,condition1,condition2,sortedAvailability,condition4 });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
function timeToMinutes(time) {
  // Split the time string into hours and minutes
  const [hours, minutes] = time.split(':').map(Number);

  // Convert hours to minutes and add minutes
  return hours * 60 + minutes;
}
function dividingTimeSlots(startTime, endTime) {
  const timeSlots = [];
  
  // Convertir l'heure de début en objet Moment
  const startMoment = moment(startTime, 'HH:mm');
  
  // Convertir l'heure de fin en objet Moment
  const endMoment = moment(endTime, 'HH:mm');
  
  // Ajouter les créneaux horaires à partir de l'heure de début jusqu'à l'heure de fin
  while (startMoment.isBefore(endMoment)) {
      timeSlots.push(startMoment.format('HH:mm'));
      startMoment.add(30, 'minutes');
  }
  
  return timeSlots;
}

router.post('/save',async(req,res,next)=>{
  try{ 
    
    let patient=null;
    let doctor=null
    const {firstName,lastName,email}=req.body;
    // Assuming you have retrieved the user data from the database
    const person = await User.findOneAndUpdate({ email},{
      firstName,
      lastName
    }); 
   
   await  person.save();
    

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
      
     
    await  patient.save();
      
    }
    // Check if the user has the 'doctor' role
     if (person.role === roles.doctor) {
       doctor= await Doctor.findOne({email})
     
      doctor.firstName=req.body.firstName
        doctor.lastName=req.body.lastName
        doctor.city=req.body.city
        doctor.specialization=req.body.specialization
        doctor.experience=req.body.experience
         const daysOfWeek=req.body.daysOfweekArray
        const startTimes=req.body.startTimesArray
        const endTimes=req.body.endTimesArray
        const { date, timeStart, timeEnd } = req.body;
        const contenu=req.body.contenu
        const typeInfo=req.body.typeInfo;
        const debut=req.body.debut
        const fin=req.body.fin
        let accurate=true;
        
         
        if(startTimes && endTimes){
       for (let i=0;i<startTimes.length;i++){
        if (timeToMinutes(startTimes[i])>timeToMinutes(endTimes[i])){
          accurate=false;
        }
       }}
       if(accurate==false){
        req.flash("warning","Veuillez choisir un horaire logique")
        
       }
        
        if (Array.isArray(daysOfWeek) && Array.isArray(startTimes) && Array.isArray(endTimes) && accurate ) {
          // Iterate over each selected day/time slot combination
          for (let i = 0; i < daysOfWeek.length; i++) {

            
             const existingIndex = doctor.availability.findIndex(slot => slot.dayOfWeek == daysOfWeek[i]);
           
         
            const existingIndex2 = doctor.availabletimeslots.findIndex(slot => slot.dayName == daysOfWeek[i]);
           
           
           
            let timeSlotExists=false;
            let overlapsExistingSlot=false;
           if (existingIndex !== -1 ){
            if(doctor.availability[existingIndex].startTimes!==0 &&doctor.availability[existingIndex].endTimes!==0)
            { timeSlotExists =  doctor.availability[existingIndex].startTimes.includes(startTimes[i]) ||
              doctor.availability[existingIndex].endTimes.includes(endTimes[i]);
           
            overlapsExistingSlot =doctor.availability[existingIndex].startTimes.some((existingStartTime, index) =>
              (timeToMinutes(startTimes[i]) >= timeToMinutes(existingStartTime) && timeToMinutes(startTimes[i]) <=timeToMinutes( doctor.availability[existingIndex].endTimes[index])) ||
              (timeToMinutes(endTimes[i]) >=timeToMinutes(existingStartTime) && timeToMinutes(endTimes[i]) <=timeToMinutes( doctor.availability[existingIndex].endTimes[index]))
          );
            
            }
         if (timeSlotExists || overlapsExistingSlot) {
        //     // Time slot already exists, skip adding it
             req.flash("warning","Veuillez choisir un autre horaire")
           
         }
          
                if(!timeSlotExists && !overlapsExistingSlot){
                doctor.availability[existingIndex].startTimes.push(startTimes[i]);
                doctor.availability[existingIndex].startTimes.sort((time1, time2) => {
                  // Convert time strings to Date objects
                  const date1 = new Date(`2000-01-01T${time1}`);
                  const date2 = new Date(`2000-01-01T${time2}`);
                
                  // Compare the Date objects
                  return date1 - date2;
                });
                doctor.availability[existingIndex].endTimes.push(endTimes[i]);
                doctor.availability[existingIndex].endTimes.sort((time1, time2) => {
                  // Convert time strings to Date objects
                  const date1 = new Date(`2000-01-01T${time1}`);
                  const date2 = new Date(`2000-01-01T${time2}`);
                
                  // Compare the Date objects
                  return date1 - date2;
                });
                if (existingIndex2 !== -1) {
                  const newTimeSlots = dividingTimeSlots(startTimes[i], endTimes[i]);
                  doctor.availabletimeslots[existingIndex2].availableTimes = doctor.availabletimeslots[existingIndex2].availableTimes.concat(newTimeSlots);
                  // Sort the availableTimes array
doctor.availabletimeslots[existingIndex2].availableTimes.sort((time1, time2) => {
  // Convert time strings to Date objects
  const date1 = new Date(`2000-01-01T${time1}`);
  const date2 = new Date(`2000-01-01T${time2}`);

  // Compare the Date objects
  return date1 - date2;
});

              }
            }
          }
          else {
                const availabilityObj = {
                    dayOfWeek: daysOfWeek[i],
                    startTimes: [startTimes[i]],
                    endTimes: [endTimes[i]]
                };
              if(existingIndex2==-1){
                const availabilityTimeslot={
                  dayName: daysOfWeek[i],
                  availableTimes:dividingTimeSlots(startTimes[i],endTimes[i]),
                  bookedTimes:[]


                }
                doctor.availabletimeslots.push(availabilityTimeslot)
              }
                doctor.availability.push(availabilityObj);
               
            } 
          } 
        }
        
        
        
           
           
           
          if(typeInfo){
            if(typeInfo=='Autre'){
              if(contenu){
              const autre={typeInfo,debut:null,fin:null,contenu}
              doctor.additionalInfo.push(autre);
            }
            else{
              req.flash('warning','saisir un contenu est nécessaire, aucune information supplémentaire ajoutée.')
            }
          }
            if(typeInfo=="Disponibilité exceptionnelle" || typeInfo=='Non disponibilité exceptionnelle'){
          if(timeStart && timeEnd ){
            if( timeToMinutes(timeStart)<timeToMinutes(timeEnd)){
          const [startHour, startMinute] = timeStart.split(':').map(Number);
          const [endHour, endMinute] = timeEnd.split(':').map(Number);
          
          // Create Date objects for the start and end times
          const startDate = new Date(date); // Date object for the selected date
          startDate.setHours(startHour, startMinute, 0, 0); // Set the time for the start of the day
          
          const endDate = new Date(date); // Date object for the selected date
          endDate.setHours(endHour, endMinute, 0, 0); 
          const additionalInfo={typeInfo,debut:startDate,fin:endDate,contenu:`${typeInfo} le ${date} de ${timeStart} à ${timeEnd}.`}
          
          
            doctor.additionalInfo.push(additionalInfo)
            if(typeInfo=="Non disponibilité exceptionnelle"){
              const timeSlots = dividingTimeSlots(timeStart, timeEnd);

              // Convert each time slot to a Date object with the specified date
              const bookedTimes = timeSlots.map(time => {
                  const [hours, minutes] = time.split(':').map(Number);
                  const slotDate = new Date(date); // Use the specified date
                  slotDate.setHours(hours, minutes, 0, 0); // Set hours and minutes
                  return slotDate;
              });
      
              // Find the correct availability entry for the specified date
              const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
              const dayofApp = daysOfWeek[new Date(date).getDay()];
              const availabilityEntry = doctor.availabletimeslots.find(entry => entry.dayName === dayofApp);
      
              if (availabilityEntry) {
                  // Add the booked times to the availability entry
                  availabilityEntry.bookedTimes.push(...bookedTimes);
              } else {
                  // If no availability entry for the day, create one
                  doctor.availabletimeslots.push({
                      dayName: dayofApp,
                      availableTimes: [],
                      bookedTimes: bookedTimes,
                 
                  });
              }
            }
           
          
         
         
         
        }
        else{
          req.flash('warning','veuillez saisir un horaire logique')
          

        }
      }
      else{
        req.flash('warning','saisir les horaires de disponibilité/non disponibilité.')
      }
    }
    if(typeInfo=='Congé'){
      if(debut && fin){
        const d=new Date(debut) 
        const f=new Date(fin)
        if(d<=f){
         const p={typeInfo,debut:d,fin:f,contenu:`En congé du ${debut} à ${fin}`}
         doctor.additionalInfo.push(p);}
         else{
          req.flash('warning','veuillez saisir une date de début et de fin de congé logiques.')
         }
      }
      else{
        req.flash('warning','Veuillez saisir la date de début et de fin de votre congé.')
      }
    }
      
      }
        
        
        await  doctor.save()
      }
        
        

     
    req.flash('success','Les changements sont enregistrés avec succès ');
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
    next(error);
   
  }
});
router.post('/delete-slot', async (req, res, next) => {
  try { 
    
    const doctor= await Doctor.findOne({email:req.body.id})
   
      const slotId = req.body.slotId;
      const startTime=req.body.startTime;
      
      
      
  

       // Find the slot object in the doctor's availability array by its ID
        let slotIndex;

        
       for(i=0;i<doctor.availability.length;i++){
       if (doctor.availability[i]._id==slotId){
           slotIndex=i;
         }

       }
    
  
    
     if (slotIndex !== -1) {
              
              let Index;
              
              
          for (i=0;i<doctor.availability[slotIndex].startTimes.length;i++){
             if(doctor.availability[slotIndex].startTimes[i]==startTime){
               Index=i;
             
            }
          }
          let dayName=doctor.availability[slotIndex].dayOfWeek;
          let starttime=doctor.availability[slotIndex].startTimes[Index];
          let endtime=doctor.availability[slotIndex].endTimes[Index];
          let Index2=doctor.availabletimeslots.findIndex(slot=>slot.dayName==dayName)
          if(Index2!==-1){
          let availableTimes=doctor.availabletimeslots[Index2].availableTimes;
          let timesToDelete = dividingTimeSlots(starttime, endtime);
          doctor.availabletimeslots[Index2].availableTimes = availableTimes.filter(time => !timesToDelete.includes(time));
          if(doctor.availabletimeslots[Index2].availableTimes.length===0){
            doctor.availabletimeslots.splice(Index2,1);
          }
        }
           doctor.availability[slotIndex].startTimes.splice(Index,1)
           doctor.availability[slotIndex].endTimes.splice(Index,1)
           if (doctor.availability[slotIndex].startTimes.length===0){
            doctor.availability.splice(slotIndex,1)

           }
          }
       
          await doctor.save();
          console.log(doctor.availabletimeslots);
          req.flash("success","Horaire supprimé avec succès")
          return res.redirect('back')
       
       
      } 
      catch (error){
         return next(error)
      }

 
});

router.get('/doctors', async (req, res, next) => {
  try {
    const person= await User.findOne({ email: req.user.email })
  
  
    
   

    
    if (person.role === roles.patient) {
      
       const patient = await Patient.findOne({ email: req.user.email });
       patient.setAllAppointmentsAbsent();
       await patient.save();
       

       }
    
      
      // Render the profile page and pass user and patient data to the template
     

    // Check if the user has the 'doctor' role
     if (person.role === roles.doctor) {
      // Assuming you have retrieved the doctor data from the database
       const doctor = await Doctor.findOne({ email: req.user.email });
       doctor.setAllAppointmentsAbsent();
       await doctor.save();}

      let doctors = await Doctor.find();
      const searchQuery = req.query.search || '';
      if (req.query.search) {
           
          const searchQueryStand = req.query.search.toLowerCase();
          const searchTerms = searchQueryStand.split(' ');

          // Filter doctors based on each search term independently
          doctors = doctors.filter(doctor => {
              return searchTerms.every(term =>
                  doctor.lastName.toLowerCase().includes(term) ||
                  doctor.firstName.toLowerCase().includes(term) ||
                  (doctor.firstName.toLowerCase() + ' ' + doctor.lastName.toLowerCase()).includes(term) ||
                  doctor.specialization.toLowerCase().includes(term) ||
                  doctor.city.toLowerCase().includes(term)
              );
          });
      }

      res.render('doctors', {
          doctors,searchQuery
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

  function isWithinFiveMinutes(appointmentDate) {
    const now = moment();
    const appointmentTime = moment(appointmentDate);
    const diff = appointmentTime.diff(now, 'minutes');

    return diff <= 5 &&  diff >= -30;;
  }
router.get('/appointments',async(req,res,next)=>{
  try {
    function formatDateTime(date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
   
    const person=await User.findOne({email:req.user.email});
    
    let doctor=null;
    let patient=null;
    let condition1=null;
    let condition2=null;
    const now = new Date();
    
    
    if(person.role===roles.patient){
      patient= await Patient.findOne({email:req.user.email})
      patient.setAllAppointmentsAbsent();

      patient.pendingAppointments = patient.pendingAppointments.filter(appointment => appointment.appointmentDate > now);
      await patient.save();

      patient.appointments.forEach(appointment => {
        appointment.showEnterButton = isWithinFiveMinutes(appointment.appointmentDate);
      });

      
   
      condition1=true;
      
    }
     
   
    if(person.role===roles.doctor){
     doctor= await Doctor.findOne({email:req.user.email})
     doctor.setAllAppointmentsAbsent();
     doctor.pendingAppointments = doctor.pendingAppointments.filter(appointment => appointment.appointmentDate > now);
     await doctor.save();

     condition2=true;

     doctor.appointments.forEach(appointment => {
      appointment.showEnterButton = isWithinFiveMinutes(appointment.appointmentDate);
    });
   
     
     
    }
    
    return res.render('appointments',{doctor,patient,condition1,condition2,formatDateTime})
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
  
//     const appDate = new Date(req.body.date);

  const reason=req.body.reason;
 
   const doctorEmail=req.body.doctorEmail
   const patientEmail=req.body.patientEmail
  const doctor= await Doctor.findOne({email:req.body.doctorEmail})
  const patient= await Patient.findOne({email: req.body.patientEmail})
  const date=req.body.date;
  const time=req.body.timeSlot;
//   let isAvailable=true;
  const appointmentId = generateUniqueId();
  
  const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
   
    
    const appDate = new Date(year, month - 1, day, hours, minutes);
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayOfApp = daysOfWeek[appDate.getDay()];
    const Index= doctor.availabletimeslots.findIndex(slot=>slot.dayName==dayOfApp);
    let Index2;
    if(appDate<new Date()){
      req.flash('warning','veuillez choisir une date valide.')
      return res.redirect('back')
    }
    if(Index!==-1){
      Index2= doctor.availabletimeslots[Index].bookedTimes.push(appDate);
    }



  



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

   

 catch (error) {
  next(error) 
  res.redirect('back');
    
}
})
router.post('/delete-app',async(req,res,next)=>{
 
  const id=req.body.appId;
  
  
  const doctor= await Doctor.findOne({email:req.body.doctorEmail})
  const patient= await Patient.findOne({email:req.body.patientEmail})
  try {
   
    const indexd = doctor.pendingAppointments.findIndex(appointment => appointment._id ==id);
        const indexp = patient.pendingAppointments.findIndex(appointment => appointment._id ==id);
        let date=new Date(doctor.pendingAppointments[indexd].appointmentDate);
        const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const day=daysOfWeek[date.getDay()]
        let Index1=doctor.availabletimeslots.findIndex(slot=>slot.dayName==day);
        let Index2;
        
        if(Index1!==-1){
           Index2=doctor.availabletimeslots[Index1].bookedTimes.findIndex(slot=> slot.getTime()==date.getTime());}

    if (indexp !== -1 && indexd!==-1) {
      
     
   //     // Remove the slot object from the availability array
     patient.pendingAppointments.splice(indexp, 1);
     
    patient.save();
   
    doctor.pendingAppointments.splice(indexd, 1);
   doctor.save();
   console.log(doctor.availabletimeslots)
   if (Index2!==-1){
    doctor.availabletimeslots[Index1].bookedTimes.splice(Index2,1)
    console.log(doctor.availabletimeslots)
     }
  req.flash('success','Rendez-vous annulé')
  
       
  }
  else{
    req.flash('error','Une erreur est detectée')
  
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
    const roomId=uuidv4();
  
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
     const appP={_id:patient.pendingAppointments[indexp],doctorEmail:patient.pendingAppointments[indexp].doctorEmail,appointmentDate:patient.pendingAppointments[indexp].appointmentDate
      ,reason:patient.pendingAppointments[indexp].reason, roomId:roomId,doctorpresent:false,patientpresent:false
     }
     patient.appointments.push(appP);
     patient.pendingAppointments.splice(indexp, 1);
        patient.save();
        const appD={_id:doctor.pendingAppointments[indexd]._id,patientEmail:doctor.pendingAppointments[indexd].patientEmail,
          appointmentDate:doctor.pendingAppointments[indexd].appointmentDate,
          reason:doctor.pendingAppointments[indexd].reason,
          roomId:roomId,
          doctorpresent:false,
          patientpresent:false
        }
        doctor.appointments.push(appD);
        doctor.pendingAppointments.splice(indexd, 1);
      doctor.save();
      
      
    
      req.flash('success','rendez-vous confirmé')
     }
   else{
    req.flash('error','une erreur est detectée')
  
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
    let condition4=null;
    
   
   
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
       if(patient.birthdate){
        condition4=true;
       }
    }
    
   return res.render('profile', { person , patient, doctor,condition1,condition2,condition3,condition4});
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
    let sortedAvailability=[]
  
   
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
      const daysOfWeekOrder = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

      // Sort the availability array based on the order of daysOfWeekOrder
         sortedAvailability = doctor.availability.sort((a, b) => {
          return daysOfWeekOrder.indexOf(a.dayOfWeek) - daysOfWeekOrder.indexOf(b.dayOfWeek);
      });

    }
    
   return res.render('profile', { person , patient, doctor,condition1,condition2,condition3,sortedAvailability});
  } catch (error) {
    next(error);
  }
});
router.post('/cancel-app',async(req,res,next)=>{
  const id=req.body.appId;
  
  console.log(req.body)
  const doctor= await Doctor.findOne({email:req.body.doctorEmail})
  const patient= await Patient.findOne({email:req.body.patientEmail})
  try {
   
    const indexd = doctor.appointments.findIndex(appointment => appointment._id ==id);
        const indexp = patient.appointments.findIndex(appointment => appointment._id ==id);
        console.log(indexp)
      let date=doctor.appointments[indexd].appointmentDate;
       
     const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
       const day=daysOfWeek[date.getDay()]
         let Index1=doctor.availabletimeslots.findIndex(slot=>slot.dayName==day);
        let Index2;
          if(Index1!==-1){
            Index2=doctor.availabletimeslots[Index1].bookedTimes.findIndex(slot=> slot.getTime()==date.getTime());}

   if (indexp !== -1 && indexd!==-1) {
      
     
     patient.appointments.splice(indexp, 1);
     
  patient.save();
   
     doctor.appointments.splice(indexd, 1);
   doctor.save();
    console.log(doctor.availabletimeslots)
   if (Index2!==-1){
     doctor.availabletimeslots[Index1].bookedTimes.splice(Index2,1)
    
     }
   req.flash('success','Rendez-vous annulé')
  
       
   }
   else{
     req.flash('error','Une erreur est detectée')
  
   }
  return res.redirect('back');
}
  catch (error) {
    next(error);
  }
})
router.get('/available-timeslots', async (req, res) => {
  try {
    const { doctorEmail, date } = req.query;
    const doctor = await Doctor.findOne({ email: doctorEmail });

    if (!doctor) {
      return res.status(404).send('Doctor not found');
    }
    
    const appDate = new Date(date);
    const today = new Date();
    const isToday = appDate.toDateString() === today.toDateString();
    const currentTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayofApp = daysOfWeek[appDate.getDay()];

    const leaveEntry = doctor.additionalInfo.some(info =>
      info.typeInfo === 'Congé' &&
      appDate >= new Date(info.debut) &&
      appDate <= new Date(info.fin)
    );

    // Find the availability entry for the day of the week
    const availabilityEntry = doctor.availabletimeslots.find(entry => entry.dayName === dayofApp);

    // Initialize availableTimes with regular availability timeslots
    let availableTimes = availabilityEntry ? availabilityEntry.availableTimes.slice() : [];

    // Check for exceptional availabilities
    const exceptionalEntries = doctor.additionalInfo.filter(info => 
      info.typeInfo === 'Disponibilité exceptionnelle' &&
      new Date(info.debut).toISOString().substring(0, 10) === appDate.toISOString().substring(0, 10)
    );

    // Generate exceptional timeslots and add them to availableTimes
    exceptionalEntries.forEach(entry => {
      const exceptionalSlots = dividingTimeSlots(
        entry.debut.toTimeString().substring(0, 5), 
        entry.fin.toTimeString().substring(0, 5)
      );
      availableTimes = availableTimes.concat(exceptionalSlots);
    });

    if (!availabilityEntry && exceptionalEntries.length === 0 || leaveEntry) {
      return res.json([]);
    } 

     // Filter out timeslots that are already booked
    const inputDate = new Date(appDate).toISOString().substring(0, 10);
    const bookedTimes = new Set(
      availabilityEntry.bookedTimes
        .filter(time => time.toISOString().substring(0, 10) === inputDate)
        .map(time => {
          const hours = time.getHours().toString().padStart(2, '0');
          const minutes = time.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        })
    );

    // Filter availableTimes to exclude booked times and times earlier than the current time if the appointment is for today
    availableTimes = availableTimes.filter(time => !bookedTimes.has(time) && (!isToday || time > currentTime));

    res.json(availableTimes); 
  } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
  }
});

router.post('/delete-additional-info', async (req, res) => {
  try {
    const id = req.body.additionalInfoId;
    const doctor = await Doctor.findOne({ email: req.body.doctorEmail });

    if (!doctor) {
      req.flash('error', 'Médecin non trouvé.');
      return res.redirect('back');
    }

    const index = doctor.additionalInfo.findIndex(slot => slot._id == id);

    if (index !== -1) {
      const additionalInfo = doctor.additionalInfo[index];

      if (additionalInfo.typeInfo === 'Non disponibilité exceptionnelle') {
        // Suppression des bookedTimes associés
        const { debut, fin } = additionalInfo;
        doctor.availabletimeslots.forEach(slot => {
          slot.bookedTimes = slot.bookedTimes.filter(time => {
            return !(time >= debut && time <= fin);
          });
        });
      }

      doctor.additionalInfo.splice(index, 1);
      await doctor.save();

      req.flash('success', 'Information supplémentaire supprimée avec succès.');
    } else {
      req.flash('error', 'Une erreur est survenue.');
    }

    console.log(doctor.additionalInfo);
    return res.redirect('back');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Erreur du serveur.');
    return res.redirect('back');
  }
});
router.get('/videocall/:roomId',async(req,res,next)=>{
  try{
    
    const person= await User.findOne({ email: req.user.email }) 
    const role=person.role
    console.log(person)
  
   
    if(role===roles.doctor){
     const doctor= await  Doctor.findOne({email: req.user.email})
     console.log(doctor)
     const Index= doctor.appointments.findIndex(app=>app.roomId==req.params.roomId)
    if(Index!==-1){
      if (! doctor.appointments[Index].doctorpresent){
         doctor.appointments[Index].doctorpresent=true;
       await  doctor.save()
       return res.render('room',{roomId:req.params.roomId})
     }
     
      else{
        req.flash('error','Accès interdit')
           return    res.render('index')} 
       
     
     }
    }
    
    


    
     else if (role===roles.patient){
      const patient=  await Patient.findOne({email: req.user.email})
       const Index=patient.appointments.findIndex(app=>app.roomId==req.params.roomId)
       if(Index!==-1){
         if(!patient.appointments[Index].patientpresent){
        patient.appointments[Index].patientpresent=true;
        await patient.save();
           return res.render('room',{roomId:req.params.roomId})

       }
       else{
        req.flash('error','Not allowed to enter')
           return    res.render('index')} 
       
     }
     }
     }
     
    
    
  
  catch(error){
     next(error) 

  }
})
module.exports = router;
const mongoose = require('mongoose');
const bcrypt=require('bcrypt');

const { Schema,model } = mongoose;

const doctorSchema = new Schema({
    firstName:{
        type:String,
        lowercase:true,
        required:true,

    },
    lastName:{
        type:String,
        lowercase:true,
        required:true,

    },
    email:{
        type:String,
        lowercase:true,
        required:true,
        unique:true
    },



    password:{
        type:String,
        required:true,
        
      
    },
    birthdate:{
        type:Date,
        
    },
    
    city: {
        type: String,
        lowercase:true
    },
    
   
    availability:[{
        dayOfWeek: {
            type: String,
            enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
            
        },
        startTimes: [String], // Array of start times
        endTimes: [String]
       
    }],
    specialization:{
      type:  String,
      lowercase:true},
    experience: Number,
   
    additionalInfo: [{
        typeInfo: { 
            type:String,
            enum:['Congé','Disponibilité exceptionnelle', 'Non disponibilité exceptionnelle','Autre'],
           
    },
    debut: Date, 
    fin: Date,
    contenu:{
        type:String
    }
        
}],
    appointments: [{
        patientEmail: String,
        appointmentDate: Date,
        reason: String,
        roomId:String,
        doctorpresent:Boolean,
        patientpresent:Boolean
    }],
    pendingAppointments: [{
        patientEmail: String,
        appointmentDate: Date,
        reason: String
    }],
    availabletimeslots:[{
        dayName: {
            type: String,
            enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
           
        },
       
        availableTimes: [String], 
        bookedTimes: [Date] 
    
    }

    ]
});
doctorSchema.pre('save',async function(){
    try{
        var doctor=this;
        const salt=await bcrypt.genSalt(10) ;
        const hashpass=await bcrypt.hash(doctor.password,salt);
       doctor.password=hashpass;
    }
    catch(error){
        throw error;
    }

} );
doctorSchema.methods.setAllAppointmentsAbsent = function () {
    this.appointments.forEach(appointment => {
      appointment.doctorpresent = false;
    });
  };


const Doctor = model('Doctor', doctorSchema);
module.exports = Doctor;
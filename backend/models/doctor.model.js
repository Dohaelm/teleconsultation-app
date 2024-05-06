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
    address: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    nationalID: {
        type: String
    },
    availability:[{
        dayOfWeek: {
            type: String,
            enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
        },
        startTime: {
            type: String, // You can use a Date object if you need more precise time handling
            required: true
        },
        endTime: {
            type: String, // You can use a Date object if you need more precise time handling
            
        },
        
       
    }],
    specialization:{
      type:  String,
      lowercase:true},
    experience: Number,
    hospitalAffiliation: String,
    additionalInfo: String,
    appointments: [{
        patientEmail: String,
        appointmentDate: Date,
        reason: String
    }],
    pendingAppointments: [{
        patientEmail: String,
        appointmentDate: Date,
        reason: String
    }]
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


const Doctor = model('Doctor', doctorSchema);
module.exports = Doctor;
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
    schedule: {
        workingHours: String,
        daysOff: [String], 
       
    },
    specialization:String,
    experience: Number,
    hospitalAffiliation: String,
    additionalInfo: String,
    appointments: [{
        patientName: String,
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
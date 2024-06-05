const mongoose=require('mongoose');
const bcrypt=require('bcrypt');


const{Schema,model}=mongoose;

const patientSchema=new Schema({
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
  
    weight: Number,
    height: Number,
    bloodType: String,

    appointments: [{
        doctorEmail: String,
        appointmentDate: Date,
        reason: String,
        roomId:String,
        doctorpresent:Boolean,
        patientpresent:Boolean

    }],
    pendingAppointments: [{
        doctorEmail: String,
        appointmentDate: Date,
        reason: String
    }]




});

patientSchema.pre('save',async function(){
    try{
        var patient=this;
        const salt=await bcrypt.genSalt(10) ;
        const hashpass=await bcrypt.hash(patient.password,salt);
        patient.password=hashpass;
    }
    catch(error){
        throw error;
    }

} );
patientSchema.methods.setAllAppointmentsAbsent = function () {
    this.appointments.forEach(appointment => {
      appointment.patientpresent = false;
    });
  };

const Patient=model('Patient',patientSchema);
module.exports=Patient;

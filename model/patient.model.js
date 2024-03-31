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
        required:true
    },
    
    city: {
        type: String,
        required: true
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
    weight: Number,
    height: Number,
    bloodType: String,
    diseases: [String],
    appointments: [{
        doctorName: String,
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


const Patient=model('Patient',patientSchema);
module.exports=Patient;

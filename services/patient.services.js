const patientModel=require('../model/patient.model')

class PatientService{
static async registerPatient(firstName,lastName,email, password, birthdate, city, address, phoneNumber, nationalID,weight,height,bloodType,diseases,appointments){
    try{
          const createPatient=new patientModel({firstName,lastName,email, password, birthdate, city, address, phoneNumber, nationalID,weight,height,bloodType,diseases,appointments});
          return await createPatient.save();
    }catch(err){
        throw err;
    }
}

}
module.exports=PatientService;
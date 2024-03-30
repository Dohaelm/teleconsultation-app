const doctorModel=require('../model/doctor.model')

class DoctorService{
static async registerDoctor (firstName,lastName,email, password, birthdate, city, address, phoneNumber, nationalID,schedule,specialization,
    experience,hospitalAffiliation,additionalInfo,appointments){
    try{
          const createDoctor=new doctorModel({firstName,lastName,email, password, birthdate, city, address, phoneNumber, nationalID,schedule,specialization,
            experience,hospitalAffiliation,additionalInfo,appointments});
          return await createDoctor.save();
    }catch(err){
        throw err;
    }
}

}
module.exports=DoctorService;
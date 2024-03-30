const userModel=require('../model/user.model')

class UserService{
static async registerUser(email, password,role){
    try{
          const createUser=new userModel({email, password,role});
          return await createUser.save();
    }catch(err){
        throw err;
    }
}

}
module.exports=UserService;
const mongoose = require('mongoose');
const bcrypt=require('bcrypt');
const createHttpError = require('http-errors');


const { Schema,model } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['patient', 'doctor','admin'],
        required: true
    }
});
userSchema.pre('save',async function(){
    try{
        var user=this;
        const salt=await bcrypt.genSalt(10) ;
        const hashpass=await bcrypt.hash(user.password,salt);
        user.password=hashpass;
    }
    catch(error){
        throw error;
    }

} );


userSchema.methods.isValidPassword= async function(password){
    try{
        const isMatch =await bcrypt.compare(password, this.password)
       
        return isMatch;
    }catch(error){
        throw createHttpError.InternalServerError(error.message)

    }
}

const User = model('User', userSchema);

module.exports = User;
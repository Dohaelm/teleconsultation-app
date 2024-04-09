const UserModel = require("../model/user.model");
const DoctorModel=require("../model/doctor.model.js")
const PatientModel=require("../model/patient.model.js")
const asyncHandler =require("express-async-handler");
const ErrorResponse =require( "../utils/ErrorResponse.js");

exports.getUsers = async (req,res,next) => {
    try {
        const users = await UserModel.find(); 
        return res.status(200).json({ status: true, data: users});
    } catch (error) {
        throw error;
    }
};
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      next(new ErrorResponse("Please prove an email and a password ! ", 400));
    }
  
    const user = await UserModel.findOne({ email }).select("+password");
  
    if (!user) {
      next(new ErrorResponse("Invalid credentials !", 401));
    }
  
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      next(new ErrorResponse("Invalid credentials !", 401));
    }
  
    sendTokenResponse(user, 200, res);
  });

  exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await UserModel.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  });
  
//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //Create token
    const token = user.getSignedJwtToken();
  
    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
  
    options.secure = true;
  
    res.status(statusCode).cookie("token", token, options).json({
      success: true,
      token,
    });
  };
  /* admin routes */
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`User of id ${req.params.id} is not found `));
    }
  
    res.status(200).json({
      success: true,
      data: user,
    });
  });
  
  exports.getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await UserModel.find();
    res.status(200).json({
      success: true,
      data: users,
    });
  });
  
  exports.addDoctor = asyncHandler(async (req, res, next) => {
    const {  firstName, 
        lastName,
         email,
          password, 
          birthdate, 
          city, 
          address,
           phoneNumber,
            nationalID, 
            schedule,
             specialization,
              experience, 
              hospitalAffiliation,
               additionalInfo,
         appointments } = req.body;
  
   
  
    const doctor = await DoctorModel.create({
        firstName, 
        lastName,
         email,
          password, 
          birthdate, 
          city, 
          address,
           phoneNumber,
            nationalID, 
            schedule,
             specialization,
              experience, 
              hospitalAffiliation,
               additionalInfo,
         appointments
    });
  
    res.status(200).json({
      success: true,
      data: doctor,
    });
  });
  
 exports.addPatient = asyncHandler(async (req, res, next) => {
    const {  firstName,
         lastName,
          email,
           password,
            birthdate, 
            city, 
            address,
             phoneNumber,
         nationalID, 
         weight, 
         height, 
         bloodType, 
         diseases,
          appointments } = req.body;
  
   
  
    const patient = await PatientModel.create({
        firstName,
         lastName,
          email,
           password,
            birthdate, 
            city, 
            address,
             phoneNumber,
         nationalID, 
         weight, 
         height, 
         bloodType, 
         diseases,
          appointments
    });
  
    res.status(200).json({
      success: true,
      data: patient,
    });
  });
  
 exports.updateDoctor = asyncHandler(async (req, res, next) => {
    let doctor = await DoctorModel.findById(req.params.id);
    if (!doctor) {
      return next(new ErrorResponse(`Doctor of id ${req.params.id} is not found `));
    }
  
    
  
    doctor = await DoctorModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
  
    res.status(200).json({
      success: true,
      data: doctor,
    });
  });
  
exports.deleteUser = asyncHandler(async (req, res, next) => {
    let user = await UserModel.findById(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`User of id ${req.params.id} is not found `));
    }
  
    if (user.role === "admin") {
      return next(new ErrorResponse("You can not delete the admin"));
    }
  
    await user.remove();
  
    res.status(200).json({
      success: true,
      data: {},
    });
  });
  
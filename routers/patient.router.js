const express=require('express');
const router = express.Router();
const{body,validationResult}=require('express-validator');

const PatientController=require("../controller/patient.controller");

router.post('/register',[body('email').trim().isEmail().
withMessage('Email must be valid').normalizeEmail().toLowerCase(),
body('password').trim().isLength(5).withMessage('Password length is less than 5')
,body('password2').custom((value, {req})=> {
    if (value !== req.body.password){
        throw new Error('Password do not match')
    }
    return true;
})
],
PatientController.register);
router.get('/register',(req,res,next)=>{
    
    res.render('register');
});
router.get('/',PatientController.getPatients);

module.exports=router;
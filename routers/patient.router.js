const express=require('express');
const router = express.Router();

const PatientController=require("../controller/patient.controller");

router.post('/register',PatientController.register);
router.get('/register',(req,res,next)=>{
    res.render('register');
});
router.get('/',PatientController.getPatients);

module.exports=router;
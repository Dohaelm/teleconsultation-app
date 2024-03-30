const router=require('express').Router();
const PatientController=require("../controller/patient.controller");
router.post('/register/patient',PatientController.register);
module.exports=router;
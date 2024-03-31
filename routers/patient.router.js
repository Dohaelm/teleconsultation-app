const express=require('express');
const router = express.Router();

const PatientController=require("../controller/patient.controller");

router.post('/',PatientController.register);

module.exports=router;
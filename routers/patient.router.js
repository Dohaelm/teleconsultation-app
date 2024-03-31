const express=require('express');
const router = express.Router();

const PatientController=require("../controller/patient.controller");

router.post('/',PatientController.register);
router.get('/',PatientController.getPatients);

module.exports=router;
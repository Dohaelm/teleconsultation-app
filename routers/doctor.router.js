const express = require('express');
const router = express.Router();
const doctorController = require('../controller/doctor.controller');

router.post('/register/doctor', doctorController.registerDoctor);

module.exports = router;
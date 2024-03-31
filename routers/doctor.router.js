const express=require('express');
const router = express.Router();

const doctorController = require('../controller/doctor.controller');

router.post('/', doctorController.registerDoctor);
router.get('/',doctorController.getDocs);

module.exports = router;
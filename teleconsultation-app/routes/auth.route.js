const router = require('express').Router();
const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const { ensureLoggedOut, ensureLoggedIn } = require('connect-ensure-login');
const { registerValidator } = require('../utils/validators');
const { roles } = require('../utils/constants');

router.get(
  '/login',
  ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {
    res.render('login');
  }
);

router.post(
  '/login',
  ensureLoggedOut({ redirectTo: '/' }),
  passport.authenticate('local', {
    // successRedirect: '/',
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
  })
);

router.get(
  '/register',
  ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {
    res.render('register');
  }
);

router.post(
  '/register',
  ensureLoggedOut({ redirectTo: '/' }),
  registerValidator,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
          req.flash('error', error.msg);
        });
        res.render('register', {
          email: req.body.email,
          messages: req.flash(),
        });
        return;
      }
      console.log(req.body)

      const {firstName,lastName,email,password,role} = req.body;
     
     
      
      const doesExist = await User.findOne({ email });
      if (doesExist) {
        req.flash('warning', 'email existant');
        res.redirect('/auth/register');
        return;
      }
      const userRole = role === 'doctor' ? roles.attente : roles.patient;
      console.log(userRole)
      const user = new User({firstName,lastName,email,password,role:userRole});
      await user.save(); 
      console.log(user)
      
      if (user.role==roles.patient){
        const patient = new Patient({_id:user.id,firstName, lastName, email, password, birthdate:null, city:null, address:null, phoneNumber:null, nationalID:null, weight:null, height:null, bloodType:null, diseases:null, appointments:[], pendingAppointments:[] });
        await patient.save();

      

      }
      req.flash(
        'success',
        `${user.email} inscrit avec succès, vous pouvez maintenant vous connecter`
      );
      res.redirect('/auth/login');
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/logout',
  ensureLoggedIn({ redirectTo: '/' }),
  async (req, res, next) => {
    req.logout();
    res.redirect('/');
  }
);

module.exports = router;

// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     next();
//   } else {
//     res.redirect('/auth/login');
//   }
// }

// function ensureNOTAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     res.redirect('back');
//   } else {
//     next();
//   }
// }

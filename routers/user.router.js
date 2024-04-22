const express=require('express');
const{body,validationResult}=require('express-validator');
const passport=require('passport');
const router = express.Router();

const UserController=require("../controller/user.controller");

router.get('/',UserController.getUsers);
router.get('/login',(req,res,next)=>{
    res.render('login');
})
router.post('/login', (passport.authenticate('local', {
    successRedirect: 'user/profile',
    failureRedirect: '/user/login'
    
  }
),function(req, res) {
  console.log("executed login!");
  console.log(req.user);}
));
  
  router.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

router.get('/profile', passport.authenticate('local',{session: true}), async (req, res, next) => {
    const person = req.user;
    
    res.render('profile', { person });
});
router.get('/logout',(req,res,next)=>{
  req.logout();
  res.redirect('/')
})
module.exports=router;
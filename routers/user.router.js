const express=require('express');
const{body,validationResult}=require('express-validator');
const passport=require('passport');
const router = express.Router();

const UserController=require("../controller/user.controller");

router.get('/',UserController.getUsers);
router.get('/login',(req,res,next)=>{
    res.render('login.ejs');
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
        if (err) {
            console.log(err);
            return next(err);
        }
        req.session.destroy(function (err) { // destroys the session
            if (err) {
                console.log(err);
                return next(err);
            }
            res.redirect('/login');
        });
    });
});
router.get('/profile', passport.authenticate('local'), async (req, res, next) => {
    const person = req.user;
    res.render('profile', { person });
});
router.get('/logout',(req,res,next)=>{
  req.logout();
  res.redirect('/')
})
module.exports=router;
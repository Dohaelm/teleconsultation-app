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
    successRedirect: '/profile',
    failureRedirect: '/user/login'
  })));
  router.post('/logout', (req, res, next) => {
    res.clearCookie('connect.sid'); 
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

module.exports=router;
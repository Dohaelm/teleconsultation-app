const express=require('express');
const{body,validationResult}=require('express-validator');
const passport=require('passport');
const router = express.Router();

const UserController=require("../controller/user.controller");

router.get('/',UserController.getUsers);
router.get('/login',(req,res,next)=>{
    res.render('login');
})
router.post('/login',passport.authenticate('local',{
    successRedirect: "/user/profile",
    failureRedirect:"/user/login",
    failureFlash:true

}));
router.get('/logout',async(req,res,next)=>{
    req.logout();
    res.redirect('/');
}); 
router.get('/profile',async(req,res,next)=>{
   
    const person=req.user;
    res.render('profile',{person});
})

module.exports=router;
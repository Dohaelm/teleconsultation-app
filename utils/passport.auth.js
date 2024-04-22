const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/user.model');

passport.use(
    new LocalStrategy({
       usernameField:"email",
       passwordField:"password",

    }, async (email, password,done)=> {
        try{
                     const user= await User.findOne({email});
                    //  if email doesn't exist
                    if(!user){
                        return done(null,false,{message:"email not registered"})
                        

                    } 
                    const isMatch= await user.isValidPassword(password);
                    console.log(isMatch)
                    // if(isMatch){
                    //         return done(null,user)
                    // }
                    // else{
                    //     return done(null,false,{message:"Incorrect Password"})

                    // }
                    return isMatch? done(null, user) : done(null,false,{message:"Incorrect password"})
        }          
        catch(error){
            done(error)
        }

    })
);
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((_id, done) => {
    User.findById(_id, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      done(null, user);
    });
  });
 
const express = require('express');
const ejs = require('ejs');
const morgan =require ('morgan');
const http = require("http");
const createHttpError= require("http-errors");
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");

dotenv.config({ path: "./config/config.env" });
connectDB();


const app = express();
const PORT = process.env.PORT;
const server = http.createServer(app);

const patientRouter = require('./routers/patient.router');
const doctorRouter = require('./routers/doctor.router'); 
const userRouter = require('./routers/user.router'); 
const indexRouter=require('./routers/index.route.js');


app.use('/user', userRouter)
app.use('/patient', patientRouter);
app.use('/doctor', doctorRouter); 
app.use('/',indexRouter);

app.use(morgan('dev'));
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use((req,res,next)=>{
  next(createHttpError.NotFound());
});
app.use((error,req,res,next)=>{
  error.status=error.status || 500;
  res.status(error.status);
  res.send(error)

})






server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
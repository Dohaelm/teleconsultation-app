const express = require('express');
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

app.use(morgan('dev'));
app.get('/',(req,res,next)=>{
  res.send('Working');
});
app.use((req,res,next)=>{
  next(createHttpError.NotFound());
});
app.use((error,req,res,next)=>{
  error.status=error.status || 500;
  res.status(error.status);
  res.send(error)

})


app.use(bodyParser.json());

app.use('/api/v1/users', userRouter)
app.use('/api/v1/patients', patientRouter);
app.use('/api/v1/doctors', doctorRouter); 




server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
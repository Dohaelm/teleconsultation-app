const express = require('express');
const path = require('path');

const http = require('http');
const socketIO = require('socket.io');
const createHttpError = require('http-errors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const connectFlash = require('connect-flash');
const passport = require('passport');
const connectMongo = require('connect-mongo');
const { ensureLoggedIn } = require('connect-ensure-login');
const { roles } = require('./utils/constants');
const Patient=require('./models/patient.model')
const User=require('./models/user.model')
const Doctor=require('./models/doctor.model')

// Initialization
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended:true}));

const MongoStore = connectMongo(session);
// Init Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure: true,
      httpOnly: true,
    },
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
const createAdminUser = async () => {
  try {
    const adminUser = await User.findOne({ email: 'admin@example.com' });

    if (!adminUser) {
      const newAdmin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com', // Set a secure email in production
        password: 'adminpassword',  // Set a secure password in production
        role: roles.admin
      });
      await newAdmin.save();
      console.log('Admin user created successfully:', newAdmin);
    } else {
      console.log('Admin user already exists');
    }
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
};

// Call the function when the app starts
createAdminUser();

// For Passport JS Authentication
app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport.auth');

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  res.locals.currentRoute = req.path;
  next();
});

// Connect Flash
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Routes
app.use('/', require('./routes/index.route'));
app.use('/auth', require('./routes/auth.route'));
app.use(
  '/user',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  require('./routes/user.route')
);
app.use(
  '/admin',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  ensureAdmin,
  require('./routes/admin.route')
);

// 404 Handler
app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

// Error Handler
app.use((error, req, res, next) => {
  error.status = error.status || 500;
  res.status(error.status);
  res.render('error_40x', { error });
});

// Setting the PORT
const PORT = process.env.PORT || 3000;

// Making a connection to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('💾 connected...');

  })
  .catch((err) => console.log(err.message));
  io.on('connection', socket => {
    console.log('A user connected');

    socket.on('join', room => {
        socket.join(room);
        const clients = io.sockets.adapter.rooms.get(room);

        if (clients.size === 2) {
            socket.to(room).emit('ready');
        }
    });

    socket.on('offer', offer => {
        socket.to('room1').emit('offer', offer);
    });

    socket.on('answer', answer => {
        socket.to('room1').emit('answer', answer);
    });

    socket.on('candidate', candidate => {
        socket.to('room1').emit('candidate', candidate);
    });

    socket.on('toggle-microphone', data => {
        socket.to('room1').emit('toggle-microphone', data);
    });

    socket.on('toggle-camera', data => {
        socket.to('room1').emit('toggle-camera', data);
    });

    socket.on('leave-call', () => {
        console.log('A user left the call');
        socket.to('room1').emit('disconnect-peer');
        socket.leave('room1');
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        socket.broadcast.emit('disconnect-peer');
    });
});
server.listen(3000, () => {
  console.log(`🚀 @ http://localhost:${PORT}`);
});

// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     next();
//   } else {
//     res.redirect('/auth/login');
//   }
// }

function ensureAdmin(req, res, next) {
  if (req.user.role === roles.admin) {
    next();
  } else {
    req.flash('warning', 'you are not Authorized to see this route');
    res.redirect('/');
  }
}

function ensureModerator(req, res, next) {
  if (req.user.role === roles.doctor) {
    next();
  } else {
    req.flash('warning', 'you are not Authorized to see this route');
    res.redirect('/');
  }
}
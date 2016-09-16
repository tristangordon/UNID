var express      = require('express');
var app          = express();
var bodyParser   = require('body-parser');
var morgan       = require('morgan');
var mongoose     = require('mongoose');
var passport	   = require('passport');
var config       = require('./config/database'); // get db config file
var User         = require('./app/models/user'); // get the mongoose model
var port         = process.env.PORT || 8080;
var jwt          = require('jwt-simple');
var Cookies      = require('cookies');
var cookieParser = require('cookie-parser');

// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
 
// log to console
app.use(morgan('dev'));
 
// Use the passport package in our application
app.use(passport.initialize());

// Serve static 'todo' files
app.use(express.static('todo'));

app.use('/node_modules', express.static('node_modules'));

// Serve Global Files
app.use('/assets', express.static('assets'));

app.use(function (req, res, next) {
  req.headers['authorization'] = 'JWT ' + req.cookies['access_token'] || 0;
  next();
});
 
// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
  res.sendfile('assets/templates/front/index.html');
});

app.get('/todo', passport.authenticate('jwt', { session: false}), function(req, res) {
  res.sendfile('assets/templates/todo/todo.html');
});

// connect to database
mongoose.connect(config.database);
 
// pass passport for configuration
require('./config/passport')(passport);
 
// bundle our routes
var apiRoutes = express.Router();
 
// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', function(req, res) {
  if (!req.body.name || !req.body.password) {
    res.json({success: false, msg: 'Please pass name and password.'});
  } else {
    var newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      firstname: req.body.firstname,
      lastname: req.body.lastname
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: err[Object.keys(err)[2]][Object.keys(err.errors)[0]]['name'] + ' : ' + err[Object.keys(err)[2]][Object.keys(err.errors)[0]]['message']});
        //console.log(err[Object.keys(err)[2]][Object.keys(err.errors)[0]]['message']);
        //return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successfully created new user.'});
    });
  }
});

// route to authenticate a user
apiRoutes.post('/authenticate', function(req, res) {
  //attempt to locate user by searching for a match with the username entered
  User.findOne({
    name: req.body.name 
  }, function(err, user) {
    if (err) throw err;
 
    if (!user) {
      //in the event that the search for username returned nothing, we check to
      //see if they entered an email address instead 
      User.findOne({
        email: req.body.name 
      }, function(err, user) {
        if (err) throw err;
        
        //if there is still no user found using the email, load auth-fail
        if (!user) {
          //res.send({success: false, msg: 'Authentication failed. User not found.'});
          res.sendfile('assets/templates/auth-fail/auth-fail.html');
        } 

        //the user has been found by email, now we check to see if the password entered matches
        //the one registered in the database 
        else {
          // check if password matches
          user.comparePassword(req.body.password, function (err, isMatch) {
            if (isMatch && !err) {
              // if user is found and password is right, create a token
              var token = jwt.encode(user, config.secret);
              // return the information including token as JSON
              res.cookie('access_token', token);

              //res.json({success: true, user: ' ' + user, token: + req.cookies['access_token']});
              res.redirect('/api/memberinfo');
              //res.sendfile('assets/todo/templates/todo.html');
            } else {
              //res.send({success: false, msg: 'Authentication failed. Wrong password.'});
              res.sendfile('assets/templates/auth-fail/auth-fail.html');
            }
          });
        }
      });
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.cookie('access_token', token);

          //res.json({success: true, user: ' ' + user, token: + req.cookies['access_token']});
          res.redirect('/api/memberinfo');
          //res.sendfile('assets/todo/templates/todo.html');
        } else {
          //res.send({success: false, msg: 'Authentication failed. Wrong password.'});
          res.sendfile('assets/templates/auth-fail/auth-fail.html');
        }
      });
    }
  });
  
});

apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          res.json({success: true, msg: 'Welcome into the member area, ' + user.firstname + ' ' + user.lastname + '!'});
          //  res.send(user);
        }
    });
  } else {
    return res.status(403).redirect('/');
  }
});
 
getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

app.get('/logout', function(req, res) {
  res.cookie('access_token', '');
  req.headers['authorization'] = '';
  res.redirect('/');
});
 
// connect the api routes under /api/*
app.use('/api', apiRoutes);
 
// Start the server
app.listen(port);
console.log('You got it, Tristan: http://localhost:' + port);

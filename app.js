var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db=require("./config/connections")
var session= require('express-session')
var fileUpload = require('express-fileUpload') 


db.connect((err)=>{
  if(err){
      console.log("connection error :"+err);
  }else{
    console.log("Database connected successfully");
  }
  })

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminrouter = require('../Fruitka/routes/admin')
var hbs = require('express-handlebars');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/',adminDir:__dirname+''}))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use( session({secret:"key",cookie:{maxAge:600000000}}))
app.use(fileUpload());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin',adminrouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const db=require("./config/connections")
const session= require('express-session')
// const fileUpload = require('express-fileUpload') 



db.connect((err)=>{
  if(err){
      console.log("connection error :"+err);
  }else{
    console.log("Database connected successfully");
  }
  })
  

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminrouter = require('../Fruitka/routes/admin')
const hbs = require('express-handlebars');
const app = express();
const helpers=require('handlebars-helpers')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/',adminDir:__dirname+''}))
app.engine("hbs",hbs.engine({helpers: {
  inc: function (value, options) {
    return parseInt(value) + 1;}},extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials',adminDir:__dirname+''}))
const HBS = hbs.create({});
HBS.handlebars.registerHelper("ifCompare", function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use( session({secret:"key",cookie:{maxAge:600000000}}))
// app.use(fileUpload());

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
  // res.status(err.status || 500);
  res.render('user/error');
});

module.exports = app;

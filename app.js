const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');;
const ejsMate = require('ejs-mate');
const { type } = require('os');
const catchAsync = require('./utilities/catchAsync');
const expresError = require('./utilities/expressError');
const Joi = require('joi');
const { required } = require('joi');
const { validate } = require('./models/campground');
const flash = require('connect-flash');
const session = require('express-session');

const  passport = require('passport');
const LocalStrategy = require('passport-local');

const campground_router = require('./routes/campground');
const review_router = require('./routes/review');

const app = express();
const User = require('./models/user');

const userRoutes = require('./routes/user');

mongoose.connect('mongodb://localhost:27017/mapper', {useNewUrlParser: true, useUnifiedTopology: true , useCreateIndex : true , useFindAndModify: false});
const db = mongoose.connection;
db.on("error",console.error.bind(console , "connection err:"));
db.once("open", () => {
    console.log("Data base connected =)");
})

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));


const sesssion_config = {
    secret : 'thisisabadsecret',
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        expires : Date.now() + 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7
    }
};
app.use(session(sesssion_config));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

app.use((req,res,next)=> {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/fakeUser',async (req,res) => {
    const user = new User({email : 'sushantthedevil@gmail.com', username : 'devilsushant'});
    const newUser = await User.register(user,'chicken');
    res.send(newUser);
})

app.use(express.static('public'));

app.use('/',userRoutes);
app.use('/cg',campground_router);
app.use('/cg/:id/reviews',review_router);

app.get('/', (req,res) => {
    res.render('home');
});


app.all('*',(req,res,next)=>{
    next(new expresError('page went wrong',404));
});

app.use((err,req,res,next)=>{
    const {statusCode = 500 , message = 'some thing went wrong'} = err;
    res.status(statusCode).render('error.ejs',{err});
});

app.listen(3030, () => {
    console.log('3030 working');
});
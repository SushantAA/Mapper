const express = require('express');
const passport = require('passport');
const router =  express.Router();
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');

router.get('/register',(req,res)=>{
    res.render('users/register');
});

router.post('/register', catchAsync (async ( req, res) => {
    try{
        console.log(req.body);
        const {email , username , password} = req.body;
        const user = new User({email,username});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser , err => {
            if(err) return next(err);
            req.flash('success','welcome to mapper');
            res.redirect('/cg');
        });
    }catch(e){
        req.flash('error',e.message);
        res.redirect('register');
    }
}));

router.get('/login',(req,res)=>{
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash : true , failureRedirect : '/login' }) ,catchAsync (async ( req, res) => {
    req.flash('success','welcome back');
    const redirectUrl = req.session.returnTo || '/cg';
    // delete req.session.returnTo;
    console.log(redirectUrl , 'return to = ' , req.session.returnTo);
    res.redirect(redirectUrl);
}));

router.get('/logout',(req,res)=> {
    req.logout();
    req.flash('success',"good bye");
    res.redirect('/cg');
})

module.exports = router;
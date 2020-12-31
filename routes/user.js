const express = require('express');
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
        console.log(registeredUser);
        req.flash('success','welcome to mapper');
        res.redirect('/cg');
    }catch(e){
        req.flash('error',e.message);
        res.redirect('register');
    }
}));

module.exports = router;
module.exports.isLogedin = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        console.log('req.originalUrl = ',req.originalUrl);
        console.log('req.session.returnTo = ',req.session.returnTo);
        req.flash('error','you , must be signed in');
        return res.redirect('/login');
    }
    next();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');;
const ejsMate = require('ejs-mate');
const {reviewSchema}  = require('./schemas');
const { type } = require('os');
const catchAsync = require('./utilities/catchAsync');
const expresError = require('./utilities/expressError');
const Joi = require('joi');
const Review = require('./models/reviews')
const { required } = require('joi');
const { validate } = require('./models/campground');

const app = express();

mongoose.connect('mongodb://localhost:27017/mapper', {useNewUrlParser: true, useUnifiedTopology: true , useCreateIndex : true});
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

const validatecg = (req,res,next) => {
    const campgroundSchema = Joi.object({
        // Campground : Joi.object({
            title : Joi.string().required(),
            price : Joi.number().required().min(0),
            image :  Joi.string().required(),
            location : Joi.string().required(),
            discription : Joi.string().required()
        // }).required()
    });

    const {error} = campgroundSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        console.log(msg);
        throw new expresError(msg,400);
    }else{
        next();
    }

}


const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        console.log(msg);
        throw new expresError(msg,400);
    }else{
        next();
    }
}


app.post('/cg/:id/reviews', validateReview ,async (req,res)=>{
    const id = req.params.id;
    console.log(req.body);
    const campground = await Campground.findById(req.params.id);
    console.log('cg ', campground);
    console.log('rev ', req.body.review);
    const review = new Review(req.body.review);

    campground.reviews.push(review);

    await review.save();
    await campground.save();

    res.redirect(`/cg/${campground._id}`);

});

app.get('/', (req,res) => {
    res.render('home');
});

app.get('/cg/new', catchAsync( async (req,res) => {
    res.render('cg/new');
}));

app.get('/cg', catchAsync( async (req,res) => {
    const all_cg = await Campground.find({});
    // res.send(all_cg);
    res.render('cg/index',{all_cg})
}));

app.post('/cg', validatecg ,catchAsync( async (req,res) => {
    const a = await Campground(req.body);
    await a.save();
    res.redirect('/cg');
}));

app.put('/cg/:id', catchAsync( async(req,res,next) => {
    const {id} = req.params;
    const a = await Campground.findByIdAndUpdate(id,req.body);
    res.redirect(`/cg/${id}`);
}));


app.get('/cg/:id/edit', catchAsync( async (req,res) => {
    const {id} = req.params;
    const a = await Campground.findById(id);
    res.render('cg/edit',{a});
}));

app.delete('/cg/:id', catchAsync( async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect(`/cg`);
}));

app.get('/cg/:id', catchAsync( async (req,res) => {
    const {id}  = req.params;
    const a = await Campground.findById(id).populate('reviews');
    console.log(a);
    res.render('cg/show_detail',{a});
}));

app.delete('/cg/:id/reviews/:reviewId',async (req,res) => {
    
});

app.get('/cg', catchAsync( async (req,res)=> {
    const camp = new Campground({title: "My backyard" , price : 100});
    await camp.save();
    res.send(camp);
}));

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
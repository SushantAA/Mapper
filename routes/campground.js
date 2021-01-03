const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const catchAsync = require('../utilities/catchAsync');
const expresError = require('../utilities/expressError');
const {reviewSchema}  = require('../schemas');
const Review = require('../models/reviews');
const Joi = require('joi');
const { isLogedin } = require('../middleware');
var multer  = require('multer');

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); 

const  {storage, cloudinary} = require('../cloudinary/index');

var upload = multer({ storage });

const validatecg = (req,res,next) => {
    const campgroundSchema = Joi.object({
        // Campground : Joi.object({
            title : Joi.string().required(),
            price : Joi.number().required().min(0),
            // image :  Joi.string().required(),
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

const isAuthor = async (req,res,next) =>{
    const {id} = req.params;
    const aa = await Campground.findById(id);    
    if(!aa.author.equals(req.user._id)){
        req.flash('error','You don\'t have permission to edit' )
        return  res.redirect(`/cg/${id}`);
    }

    next();
}

const isReviewAuthor = async (req,res,next) =>{
    const {reviewId , id} = req.params;
    const aa = await Review.findById(reviewId);    
    if(!aa.author.equals(req.user._id)){
        req.flash('error','You don\'t have permission to edit' )
        return  res.redirect(`/cg/${id}`);
    }

    next();
}

router.get('/new',isLogedin,catchAsync( async (req,res) => {
    res.render('cg/new');
}));

router.get('/', catchAsync( async (req,res) => {
    const all_cg = await Campground.find({});
    // res.send(all_cg);
    res.render('cg/index',{all_cg})
}));

router.post('/', isLogedin ,upload.array('image'),validatecg ,catchAsync( async (req,res) => {
    
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()

    // res.send(geoData.body.features[0].geometry.coordinates);

    // res.send('ok>>>>>>');
    console.log('================');
    const a = await Campground(req.body);
    a.geometry = geoData.body.features[0].geometry;
    a.image = req.files.map(f => ({ url: f.path,filename: f.filename }));
    a.author = req.user._id;
    await a.save();
    console.log(a);
    req.flash('success','successfully made new mapper');
    res.redirect('/cg');
}));

// router.post('/',  upload.array('image')  , (req,res) => {
//    console.log(req.body);
//    console.log('file = ',req.files);
//     res.send('it worked ?');
// });

router.put('/:id',isAuthor, upload.array('image') ,catchAsync( async(req,res,next) => {
    const {id} = req.params;
    console.log(req.body);
    const a = await Campground.findByIdAndUpdate(id,req.body);
    
    if(req.body.deleteImage){

        for(let ai of req.body.deleteImage){
            await cloudinary.uploader.destroy(ai);
        }

        console.log('----------------------------------');
        await a.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImage } }} })
        console.log(req.body);
    }

    const arr = req.files.map(f => ({ url: f.path,filename: f.filename }));
    a.image.push(...arr);
    await a.save();
    req.flash('success','succesfully updated mapper');
    res.redirect(`/cg/${id}`);
}));


router.get('/:id/edit',isLogedin , isAuthor ,catchAsync( async (req,res) => {
    const {id} = req.params;
    const a = await Campground.findById(id);
    res.render('cg/edit',{a});
}));

router.delete('/:id',isAuthor ,catchAsync( async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','succesfully deleted mapper');
    res.redirect(`/cg`);
}));

router.get('/:id', catchAsync( async (req,res) => {
    const {id}  = req.params;
    const a = await (await Campground.findById(id).populate({
        path : 'reviews',
        populate : {
            path : 'author'
        }
    }).populate('author'));
    console.log(a);
    if(!a){
        req.flash('error','cannot find mapper');
        return  res.redirect('/cg');
    }
    // console.log(a);
    res.render('cg/show_detail',{a});
}));

router.get('/', catchAsync( async (req,res)=> {
    const camp = new Campground({title: "My backyard" , price : 100});
    await camp.save();
    res.send(camp);
}));

module.exports = router;
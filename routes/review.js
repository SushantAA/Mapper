const express = require('express');
const router = express.Router({mergeParams : true});
const Campground = require('../models/campground');
const catchAsync = require('../utilities/catchAsync');
const expresError = require('../utilities/expressError');
const {reviewSchema}  = require('../schemas');
const Review = require('../models/reviews')
const { isLogedin } = require('../middleware');

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


router.post('/', isLogedin ,validateReview ,async (req,res)=>{
    const id = req.params.id;
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;

    campground.reviews.push(review);

    await review.save();
    await campground.save();

    req.flash('success','succesfully add review to mapper');

    res.redirect(`/cg/${campground._id}`);

});

router.delete('/:reviewId',async (req,res) => {
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{ $pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','succesfully deleted');
    res.redirect(`/cg/${id}`);
    // res.send('sdfsfdf');
});

module.exports = router;
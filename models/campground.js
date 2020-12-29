const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title : String,
    price : Number,
    image : String,
    discription : String,
    location : String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
});

module.exports = mongoose.model('Campground',CampgroundSchema);
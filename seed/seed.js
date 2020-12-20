const mongoose = require('mongoose');
const Campground = require('../models/campground');
const {places , descriptors} = require('./seedHelper');
const cities = require('./cities');

mongoose.connect('mongodb://localhost:27017/mapper', {useNewUrlParser: true, useUnifiedTopology: true , useCreateIndex : true});
const db = mongoose.connection;
db.on("error",console.error.bind(console , "connection err:"));
db.once("open", () => {
    console.log("Data base connected =)");
})

const sample = arr => arr[Math.floor(Math.random()*arr.length)];

const seedDB = async () => {
    console.log('data creation');
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const r = Math.floor(Math.random()*1000);

        const temp =  new Campground({
            location : `${cities[r].city} , ${cities[r].state}`,
            title : `${sample(places)} ${sample(descriptors)} `
        })
        await temp.save();
    }
}

seedDB();

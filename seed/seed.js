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
        // const p = Math.floor(Math.random()*100);
        const temp =  new Campground({
            author : '5fed57e013dbd00231cf8292',
            title : `${sample(places)} ${sample(descriptors)} `,
            price : r,
            image : [
                        { 
                            url : "https://res.cloudinary.com/drbey8vzq/image/upload/v1609660628/Mapper/euf53pbvgauistztwd7q.jpg", 
                            filename : "Mapper/euf53pbvgauistztwd7q" 
                        } 
                    ],
            discription : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate ipsa harum distinctio rem. Corrupti asperiores eius praesentium quae rem, amet aperiam quod, et hic, voluptates eligendi nostrum deserunt quas sequi.',
            location : `${cities[r].city} , ${cities[r].state}`
        })
        await temp.save();
    }
}

seedDB();

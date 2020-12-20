const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Campground = require('./models/campground');

const app = express();

mongoose.connect('mongodb://localhost:27017/mapper', {useNewUrlParser: true, useUnifiedTopology: true , useCreateIndex : true});
const db = mongoose.connection;
db.on("error",console.error.bind(console , "connection err:"));
db.once("open", () => {
    console.log("Data base connected =)");
})

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.get('/', (req,res) => {
    res.render('home');
})

app.get('/cg',async (req,res)=> {
    const camp = new Campground({name: "My backyard" , price : 100});
    await camp.save();
    res.send(camp);
});

app.listen(3030, () => {
    console.log('3030 working');
});
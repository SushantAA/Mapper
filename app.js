const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

const app = express();

mongoose.connect('mongodb://localhost:27017/mapper', {useNewUrlParser: true, useUnifiedTopology: true , useCreateIndex : true});
const db = mongoose.connection;
db.on("error",console.error.bind(console , "connection err:"));
db.once("open", () => {
    console.log("Data base connected =)");
})

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.get('/', (req,res) => {
    res.render('home');
});

app.get('/cg/new', async (req,res) => {
    res.render('cg/new');
});

app.get('/cg',async (req,res) => {
    const all_cg = await Campground.find({});
    // res.send(all_cg);
    res.render('cg/index',{all_cg})
});

app.post('/cg', async (req,res) => {
    const a = await Campground(req.body);
    await a.save();
    // res.send(req.body);
    res.redirect('/cg');
});

app.put('/cg/:id', async(req,res) => {
    const {id} = req.params;
    const a = await Campground.findByIdAndUpdate(id,req.body);
    // res.send('updated =}');
    res.redirect(`/cg/${id}`);
});

app.get('/cg/:id/edit', async (req,res) => {
    const {id} = req.params;
    res.render('cg/edit',{id});
});

app.delete('/cg/:id', async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    // res.send('DELETED @#');
    res.redirect(`/cg`);
});

app.get('/cg/:id', async (req,res) => {
    const {id}  = req.params;
    const a = await Campground.findById(id);
    res.render('cg/show_detail',{a});
});



app.get('/cg',async (req,res)=> {
    const camp = new Campground({title: "My backyard" , price : 100});
    await camp.save();
    res.send(camp);
});

app.listen(3030, () => {
    console.log('3030 working');
});
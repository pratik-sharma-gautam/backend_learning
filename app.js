const express=require('express');
const app=express();
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

const port=3000;

app.get('/',(req,res)=>{
    res.send('Hello World!');
});

app.get('/login',(req,res)=>{
    res.send('Login Page');
});

app.get('/profile',(req,res)=>{
    res.render('index.ejs');
});

app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});
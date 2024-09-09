const express = require('express');
const router = express.Router();
const User = require('../model/user')

router.get('/register',(req,res) => {
    res.render('register')
})
  
router.post('/register', async(req,res) => {
    const {firstName,lastName,email,password,phoneNumber,address} = req.body;

  
    try{
        let newUser = await User.findOne({email})
        if(newUser){
            return res.status(400).json({message:'that user exist!, please login'})
        }


        newUser = new User({firstName,lastName,email,password,phoneNumber,address,});
        await newUser.save();


        res.cookie('name',firstName,{maxAge:2*365*24*60*60*1000})
        res.cookie('userId',newUser._id.toString(),{maxAge:2*365*24*60*60*1000});
        res.redirect('/');
    }catch(error){
        console.log('there is a problem in save a new user', error);     
    }
})

module.exports = router;
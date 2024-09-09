const nodemailer = require('nodemailer');
const crypto = require('crypto');

function generateOtp(){
   return crypto.randomInt(100000,999999).toString();
}

async function sendOtp(email,otp){
    let transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'storyblog.ravi@gmail.com',
            pass:'pkeo baox eoqp kcrf'            
        }
    });

    let mailOption = {
        from:'storyblog.ravi@gmail.com',
        to:email,
        subject:'your otp',
        text : `your otp is for a email varification : ${otp}`
    }

    transporter.sendMail(mailOption,function(error,info){
        if (error) {
            console.log('Error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

module.exports = {generateOtp, sendOtp};
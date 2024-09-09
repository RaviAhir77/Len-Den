const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName:{type:String, required:true},
    lastName:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String,required:true,},
    phoneNumber:{type:Number,require:true},
    address:{type:String,require:true},
    isVerifeid:{type:Boolean,default:false},
    createdAt:{type:Date,default:Date.now},
})

let User = mongoose.model('User',userSchema);

module.exports = User;
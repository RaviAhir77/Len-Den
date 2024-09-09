const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
   photo:{type:String,required:true}, 
   heading:{type:String,required:true}, 
   aboutItem:{type:String,required:true}, 
   price:{type:Number,required:true}, 
   catogory:{type:String,require:true},
   city:{type:String,required:true},
   address:{type:String,required:true},  
   user:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true}, 
   createdAt:{type:Date,default:Date.now},
})

module.exports = mongoose.model('Item',itemSchema)
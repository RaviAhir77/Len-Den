const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    itemId:{type:mongoose.Schema.Types.ObjectId, ref:'Item', required:true},
    createdAt:{type:Date,default:Date.now},
})

module.exports = mongoose.model('Bookmark',bookmarkSchema)
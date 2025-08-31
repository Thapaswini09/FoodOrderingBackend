
const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    age:{type:Number,required:true},
    gender:{type:String,required:true},
    phonenumber:{type:Number,required:true},
    latitude:{type:String,required:true},
    longitude:{type:String,required:true},
})
module.exports=mongoose.model('users',userSchema)
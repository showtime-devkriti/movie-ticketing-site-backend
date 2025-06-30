const { ObjectId } = require("bson");
const mongoose = require("mongoose"); 

const {Schema}=require("mongoose");


const userschema= new Schema({
    email:{type:String,unique:true},
    password:String,
    fullname:String,
    username:{type:String,unique:true},
    phonenumber:String

    

})

const usermodel =mongoose.model("users",userschema);
module.exports={
    usermodel
}
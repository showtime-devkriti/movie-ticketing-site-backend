const express = require("express");
const app=express();
const mongoose = require("mongoose"); 
const {authrouter}=require("./Routes/authroutes")
const {adminrouter}=require("./Routes/adminroutes")
const {userrouter}=require("./Routes/userroutes")

app.use(express.json());
app.use("/api/auth",authrouter);
app.use("/api/admin",adminrouter);
app.use("/api/user",userrouter);
 

 async function main(){
     mongoose.connect("mongodb+srv://Rahul_2245:Rahul%40123@cluster0.cuy85la.mongodb.net/ticketbooking");
    app.listen(3000);
}
main();  


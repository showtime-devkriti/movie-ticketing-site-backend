const express = require("express");
const app=express();
const mongoose = require("mongoose"); 
const {authrouter}=require("./Routes/authroutes")
const {adminrouter}=require("./Routes/adminroutes")
const {userrouter}=require("./Routes/userroutes")
const { movierouter }=require("./Routes/movieroutes")
const { theatrerouter }=require("./Routes/theatreroutes")
const {additionalrouter}=require("./Routes/otherroutes")
const {bookingrouter}=require("./Routes/bookingroutes")
const {paymentrouter}=require("./Routes/paymentroutes")
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173", // Allow all origins, you can specify specific origins if needed
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials:true
  }));
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use("/api/auth",authrouter);
app.use("/api/admin",adminrouter);
app.use("/api/user",userrouter);
app.use("/api/movies",movierouter)
app.use("/api/theatres",theatrerouter)
app.use("/api/bookticket",bookingrouter)
app.use("/api/payment",paymentrouter)
app.use("/api",additionalrouter)



app.get("/api/message", (req, res) => {
    res.json({ message: "Hello from Express!" });
  });

 

 async function main(){
     mongoose.connect("mongodb+srv://Rahul_2245:Rahul%40123@cluster0.cuy85la.mongodb.net/ticketbooking");
    app.listen(3000);
}
main();  



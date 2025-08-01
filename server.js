const express = require("express");
const app=express();
const http = require("http");
const socketIO = require("socket.io"); 
const {startShowtimeCleanupJob}=require("./constants/showtimecleanup")
const mongoose = require("mongoose"); 
const {authrouter}=require("./Routes/authroutes")
const {adminrouter}=require("./Routes/adminroutes")
const {userrouter}=require("./Routes/userroutes")
const { movierouter }=require("./Routes/movieroutes")
const { theatrerouter }=require("./Routes/theatreroutes")
const {additionalrouter}=require("./Routes/otherroutes")
const {bookingrouter}=require("./Routes/bookingroutes")
const {paymentrouter}=require("./Routes/paymentroutes")
const {showtimemodel} = require("./models/showtimemodel");
const {lockedSeats}=require("./constants/websockets") 
const cookieParser = require("cookie-parser");
require("dotenv").config();
const cors = require("cors");

app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173","http://localhost:5500","http://192.168.67.185:5173"], // Allow all origins, you can specify specific origins if needed
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
startShowtimeCleanupJob();




function cleanupExpiredLocks(){
  const now = Date.now();
  const lockDuration = 10 * 60 * 1000;
   lockedSeats.forEach((seatsMap, showtimeId) =>{
     seatsMap.forEach((lockInfo, seatId)=>{
      if (now - lockInfo.timestamp > lockDuration) {
                // Lock expired, remove it
                seatsMap.delete(seatId);
               
                const io = app.get("io"); 
                if (io) {
                    io.to(showtimeId).emit("seat-unlocked", { showtimeid: showtimeId, seatid: seatId, releasedBy: "timeout" });
                }
                console.log(`Cleaned up expired lock for showtime: ${showtimeId}, seat: ${seatId}`);
            }
        });
         if (seatsMap.size === 0) {
            lockedSeats.delete(showtimeId); // Remove showtime entry if no seats locked
        }
  });
}
setInterval(cleanupExpiredLocks, 60 * 1000);


 

 async function main(){
  try {
         mongoose.connect("mongodb+srv://Rahul_2245:Rahul%40123@cluster0.cuy85la.mongodb.net/ticketbooking");
   const server=http.createServer(app);
   const io=new socketIO.Server(server,{
    cors:{
      origin:["http://localhost:5173","http://localhost:5500","http://192.168.67.185:5173"], 
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    }
     
   })
    app.set("io", io);
    io.on("connection",(socket)=>{
      console.log("socket.IO client connected:",socket.id)
    socket.on("join-showtime",({showtimeid})=>{
      if(showtimeid){
        socket.join(showtimeid);
        console.log(`socket ${socket.id} joined the showtime ${showtimeid}`)
        const lockedseatsshowtime=lockedSeats.get(showtimeid);
        if(lockedseatsshowtime){
          lockedseatsshowtime.forEach((lockInfo,seatId)=>{
              if (lockInfo.socketId !== socket.id) {
                                socket.emit("seat-locked", { showtimeid, seatid: seatId, lockedBy: lockInfo.userId });
                            }
          })
        }
      
        
      }
    })
     socket.on("select-seat", async (data) => {
                const { showtimeid, seatid, userId } = data; // Ensure userId is sent from frontend or derived here
                console.log(`Seat selected request: showtime=${showtimeid}, seat=${seatid}, user=${userId}, socket=${socket.id}`);

                if (!showtimeid || !seatid || !userId) {
                    socket.emit("seat-selection-error", { msg: "Missing showtimeid, seatid, or userId", data });
                    return;
                }

                try {
                    const showtime = await showtimemodel.findById(showtimeid);
                    if (!showtime) {
                        socket.emit("seat-selection-error", { msg: "Showtime not found", showtimeid });
                        return;
                    }

                    if (!showtime.availableseats.includes(seatid)) {
                        socket.emit("seat-selection-error", { msg: "Seat is already booked", seatid });
                        return;
                    }

                    // Check if seat is already temporarily locked
                    let showtimeLockedSeats = lockedSeats.get(showtimeid);
                    if (!showtimeLockedSeats) {
                        showtimeLockedSeats = new Map();
                        lockedSeats.set(showtimeid, showtimeLockedSeats);
                    }

                    if (showtimeLockedSeats.has(seatid)) {
                        const existingLock = showtimeLockedSeats.get(seatid);
                        if (existingLock.socketId === socket.id) {
                            // This user already locked it, just update timestamp
                             showtimeLockedSeats.set(seatid, { ...existingLock, timestamp: Date.now() });
                             socket.emit("seat-locked", { showtimeid, seatid, lockedBy: userId, isSelf: true });
                             console.log(`Seat ${seatid} for showtime ${showtimeid} already locked by self, timestamp updated.`);
                             return;
                        } else {
                            socket.emit("seat-selection-error", { msg: "Seat is temporarily locked by another user", seatid });
                            return;
                        }
                    }

                    // Lock the seat
                    showtimeLockedSeats.set(seatid, { socketId: socket.id, userId: userId, timestamp: Date.now() });

                    // Broadcast to all clients in the showtime's room (excluding sender)
                    socket.to(showtimeid).emit("seat-locked", { showtimeid, seatid, lockedBy: userId });
           
                    socket.emit("seat-locked", { showtimeid, seatid, lockedBy: userId, isSelf: true });
                    console.log(`Seat ${seatid} for showtime ${showtimeid} locked by ${userId} (socket ${socket.id}).`);

                } catch (error) {
                    console.error("Error selecting seat:", error);
                    socket.emit("seat-selection-error", { msg: "Server error during seat selection", error: error.message });
                }
            });
                 socket.on("unselect-seat", async (data) => {
                const { showtimeid, seatid, userId } = data; // Ensure userId is sent
                console.log(`Seat unselected request: showtime=${showtimeid}, seat=${seatid}, user=${userId}, socket=${socket.id}`);

                if (!showtimeid || !seatid || !userId) {
                    socket.emit("seat-selection-error", { msg: "Missing showtimeid, seatid, or userId", data });
                    return;
                }

                let showtimeLockedSeats = lockedSeats.get(showtimeid);
                if (showtimeLockedSeats && showtimeLockedSeats.has(seatid)) {
                    const lockInfo = showtimeLockedSeats.get(seatid);
                    if (lockInfo.socketId === socket.id) { // Only allow the locker to unlock
                        showtimeLockedSeats.delete(seatid);
                        if (showtimeLockedSeats.size === 0) {
                            lockedSeats.delete(showtimeid);
                        }
                        // Broadcast to all clients in the showtime's room (including sender to update their UI)
                        io.to(showtimeid).emit("seat-unlocked", { showtimeid, seatid, releasedBy: userId });
                        console.log(`Seat ${seatid} for showtime ${showtimeid} unlocked by ${userId} (socket ${socket.id}).`);
                    } else {
                        socket.emit("seat-selection-error", { msg: "You do not own this temporary lock", seatid });
                        console.log(`Attempt to unlock seat ${seatid} by non-owner ${userId} (socket ${socket.id}).`);
                    }
                } else {
                     socket.emit("seat-selection-error", { msg: "Seat was not locked or already unlocked", seatid });
                     console.log(`Seat ${seatid} for showtime ${showtimeid} not found in locks.`);
                }
            });

       socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
                // Release any seats locked by this disconnected socket
                lockedSeats.forEach((seatsMap, showtimeId) => {
                    seatsMap.forEach((lockInfo, seatId) => {
                        if (lockInfo.socketId === socket.id) {
                            seatsMap.delete(seatId);
                            if (seatsMap.size === 0) {
                                lockedSeats.delete(showtimeId);
                            }
                            // Inform others that this seat is now unlocked
                            const io = app.get("io"); // Get the io instance
                            if (io) {
                                io.to(showtimeId).emit("seat-unlocked", { showtimeid: showtimeId, seatid: seatId, releasedBy: "disconnect" });
                            }
                            console.log(`Disconnected socket ${socket.id} released lock for showtime: ${showtimeId}, seat: ${seatId}`);
                        }
                    });
                });
            });
    })
    server.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });

    
  } catch (error) {
     console.error("Server startup error:", error.message);
  }}

main();  

 

const {showtimemodel}=require("../models/showtimemodel")
const cron = require("node-cron");

function startShowtimeCleanupJob() {
    cron.schedule("* * * * *",async function(){
      const nowUTC = new Date();
const istOffsetMs = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
const nowIST = new Date(nowUTC.getTime() + istOffsetMs);

console.log("IST Date Object:", nowIST);
        try {
            const result = await showtimemodel.deleteMany({ starttime: { $lt: nowIST } });
            if (result.deletedCount > 0) {
        console.log(` Deleted ${result.deletedCount} expired showtimes`);
      }
            
        } catch (error) {
            console.error(" Error while deleting expired showtimes:", error.message)
            
        }

    })
}
module.exports={
    startShowtimeCleanupJob
}
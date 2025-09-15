const mongoose = require("mongoose");
const intiData = require("./data.js");
const Listing= require("../models/listing.js");

main().then(()=> console.log("connection success!")).catch((err)=> console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
} 

const initDB = async ()=>{
   await Listing.deleteMany({});
    await Listing.insertMany(intiData.data);
    console.log("Data is initialised!");
}
initDB();
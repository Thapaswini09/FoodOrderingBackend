const mongoose=require('mongoose');
require('dotenv').config();
const dbUrl=process.env.DB_URL
const dbConnetion=async()=>{
    try {
        await mongoose.connect(dbUrl);
        console.log(`Database connected successfully`);
        
    } catch (error) {
        console.log(`Database connection error ${error}`);
        
    }
}
module.exports=dbConnetion
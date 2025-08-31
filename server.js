const express=require('express');
const dbConnetion = require('./dbConnection/dbConnection');
const cors=require('cors')
const cookieParser = require('cookie-parser');
const router=require('./Router/router')
const path = require('path');
const app=express();
const dotenv=require('dotenv').config();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    // origin: '*'
   origin: 'http://localhost:3001', // your React frontend
  credentials: true 
   
  }));

dbConnetion()
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api',router)

const PORT=process.env.PORT;
app.listen(PORT,()=>console.log(`server is running on ${PORT}`));
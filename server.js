require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
var db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => {
    console.log('connected to database');
    //const parser = require('./parser');
    //const adminData = require('./fakedata');
    //var adm = adminData.generateFakeData();
    //db.collection("admins").insertMany(adm);
   // var accessEntries = parser.parseAccessLog();
   // db.collection("logs").insertMany(accessEntries);
   // var dataxceiverEntries = parser.parseDataXceiver();
   // db.collection("logs").insertMany(dataxceiverEntries);
   // var dataNameSys = parser.parseNameSystem();
   // db.collection("logs").insertMany(dataNameSys);
   //parser.parseNameSystem();
})

app.use(express.json())

const logsRouter = require('./routes/logs')
app.use('/logs', logsRouter)

const adminsRouter = require('./routes/admins')
app.use('/admins', adminsRouter)

app.listen(3005, () => {
    console.log('server started')
})
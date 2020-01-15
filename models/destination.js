const mongoose = require('mongoose')

const destinationSchema = new mongoose.Schema({
      _id: {
        type: Number,
        required: true
      },
      destination_ip: {
        type: String,
        required: false
      }      
})

// exporting our destination schema
module.exports = mongoose.model('Destination', destinationSchema)
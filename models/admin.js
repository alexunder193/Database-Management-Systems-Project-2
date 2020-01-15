const mongoose = require('mongoose')
const Log = require('../models/log')

const adminSchema = new mongoose.Schema({
      _id: {
        type: Number,
        required: true
      },
      username: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      telephone: {
        type: String,
        required: true
      },
      logs: [
        {
          _id: {
            type: Number,
            required: false,
            maximum: 1000
          },
          ref: {
            type: Number,
            ref:'Log',
            required: false
          }
        }
      ]
})

// exporting our admin schema
module.exports = mongoose.model('Admin', adminSchema)
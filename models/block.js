const mongoose = require('mongoose')

const blockSchema = new mongoose.Schema({
      _id: {
        type: Number,
        required: true
      },
      block_id: {
        type: String,
        required: false
      }      
})

// exporting our block schema
module.exports = mongoose.model('Block', blockSchema)
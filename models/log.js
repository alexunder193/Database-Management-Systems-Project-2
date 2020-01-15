const mongoose = require('mongoose')

const logSchema = new mongoose.Schema({
      _id: {
        type: Number,
        required: true
      },
      source_ip: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: false
      },
      access_log: {
        method: {
          type: String,
          required: false
        },
        referer: {
          type: String,
          required: false
        },
        resource: {
          type: String,
          required: false
        },
        response: {
          type: Number,
          required: false
        },
        user_agent: {
          type: String,
          required: false
        },
        user_id: {
          type: String,
          required: false
        }
      },
      destination: [
        {
          _id: {
            type: Number,
            required: false
          },
          destination_ip: {
            type: String,
            required: false
          }
        }
      ],
      block: [
        {    
          _id: {
            type: Number,
            required: false
          },
          block_id: {
            type: String,
            required: false
          }
      }
    ]
})

// exporting our log schema
module.exports = mongoose.model('Log', logSchema)
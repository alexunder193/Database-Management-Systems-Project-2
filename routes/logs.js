const express = require('express')
const router = express.Router()
const Log = require('../models/log')
const Admin = require('../models/admin')

// Get all logs
router.get('/', async (req, res) => {
    try {
        const logs = await Log.find()
        res.json(logs)
    } catch (err) {
        res.status(500).json({ message: err.message })
      }
  })

//Get one Log
router.get('/:id', getLog , async (req, res) => {
    res.json(res.log)
})

// Create one log
router.post('/',async (req, res) => {
   let logs = await Log.find().count();
   let lastLog = await Log.find().sort( { _id : -1 } ).limit(1);
    logs=lastLog[0]._id;
    var currentDate = new Date();

    var i = 1;
    for(var key in req.body.destination) {
      var obj = req.body.destination[key];
      obj._id = i;
      i++;
    }
    
    i = 1;
    for(var key in req.body.block) {
      var obj = req.body.block[key];
      obj._id = i;
      i++;
    }

    const log = new Log({
        _id: logs+1,
        source_ip: req.body.source_ip,
        timestamp: currentDate,
        type: req.body.type,
        size: req.body.size,
        access_log: req.body.access_log,
        destination: req.body.destination,
        block: req.body.block
    })
    try {
        const newLog = await log.save()
        res.status(201).json(newLog)
      } catch (err) {
        res.status(400).json({ message: err.message })
      }
})

// Update one log
router.patch('/:id', getLog, async (req, res) => {
    if (req.body.source_ip != null) {
        res.log.source_ip = req.body.source_ip
    }
	if (req.body.timestamp != null) {
        res.log.timestamp = req.body.timestamp
    }
    if (req.body.type != null) {
        res.log.type = req.body.type
    }
	if (req.body.size != null) {
        res.log.size = req.body.size
    }
  if (res.log.type === 'Access') {
    if (req.body.access_log.response != null) {
          res.log.access_log.response = req.body.access_log.response
      }
    if (req.body.access_log.referer != null) {
          res.log.access_log.referer = req.body.access_log.referer
      }
    if (req.body.access_log.resource != null) {
          res.log.access_log.resource = req.body.access_log.resource
      }
    if (req.body.access_log.user_agent != null) {
          res.log.access_log.user_agent = req.body.access_log.user_agent
      }
      if (req.body.access_log.user_id != null) {
            res.log.access_log.user_id = req.body.access_log.user_id
        }
      if (req.body.access_log.method != null) {
            res.log.access_log.method = req.body.access_log.method
        }
  }
  else {

    let countDestination = res.log.destination.length + 1;
    let countBlock = res.log.block.length + 1;
    for(var key in req.body.destination) {
          var obj = req.body.destination[key];
          obj._id = countDestination;
          countDestination++;
      res.log.destination.push(obj);
      }
    for(var key in req.body.block) {
          var obj = req.body.block[key];
          obj._id = countBlock;
          countBlock++;
      res.log.block.push(obj);
      }
  }
    try {
        const updatedLog = await res.log.save()
        res.json(updatedLog)
    } catch {
        res.status(400).json({ message: err.message })
    }
})

// Delete one log
router.delete('/:id', getLog , async (req, res) => {
  let admins = await Admin.find({"logs.ref":res.log._id});
  for(var key in admins) {
      var obj = admins[key];
      var j=0;
      let arr = []
      for (var key1 in obj.logs) {
        let obj1 = obj.logs[key1];
        if (obj1.ref != res.log._id) {
          arr.push(obj1); 
        }
      }
      obj.logs = arr;
      const newLog = await obj.save();
    }

      try {
          await res.log.remove()
          res.json({ message: 'Deleted This Log' })
        } catch(err) {
          res.status(500).json({ message: err.message })
        }
})

async function getLog(req, res, next) {
    try {
      log = await Log.findById(req.params.id)
      if (log == null) {
        return res.status(404).json({ message: 'Cant find log'})
      }
    } catch(err){
      return res.status(500).json({ message: err.message })
    }
  
    res.log = log
    next()
}

module.exports = router
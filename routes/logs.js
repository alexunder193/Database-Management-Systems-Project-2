const express = require('express')
const router = express.Router()
const Log = require('../models/log')
const Admin = require('../models/admin')

// Get all logs
// router.get('/', async (req, res) => {
//     try {
//         const logs = await Log.find()
//         res.json(logs)
//     } catch (err) {
//         res.status(500).json({ message: err.message })
//       }
//   })

router.get('/', async (req, res) => {
  try {
    var lgs;
    if (req.body.query == 1) { 
      lgs = await Log.aggregate([{$match:{$and:[{timestamp:{$gt:new Date(req.body.startDate)}},{timestamp:{$lt:new Date(req.body.endDate)}}]}},{$group:{_id:{typos:"$type"},total:{$sum:1}}},{$sort:{total:-1}}])
    }
    if (req.body.query == 2) {
      lgs = await Log.aggregate([{$match:{$and:[{timestamp:{$gt:new Date(req.body.startDate)}},{timestamp:{$lt:new Date(req.body.endDate)}},{type:req.body.type}]}},{$group:{_id:{date:{$substr:["$timestamp",0,10]}},total:{$sum:1}}}])
    }
    if (req.body.query == 3) {
      lgs = await Log.aggregate([{$project:{_id:1,source_ip:1,type:1,day:{$substr:["$timestamp",0,10]}}},{$match:{day:req.body.day}},{$group:{_id:{ip:"$source_ip",type:"$type"},count:{$sum:1}}},{$sort:{source_ip:-1,count:-1}},{$group:{_id:"$_id.ip",arr:{$push:{typ:"$_id.type"}}}},{$project:{arr:{$slice:["$arr",3]}}}])
    }
    if (req.body.query == 4) {
      lgs = await Log.aggregate([{$match:{$and:[{timestamp:{$gt:new Date(req.body.startDate)}},{timestamp:{$lt:new Date(req.body.endDate)}},{type:"Access"}]}},{$group:{_id:{method:"$access_log.method"},total:{$sum:1}}},{$sort:{total:1}},{$limit:2}])
    }
    if (req.body.query == 5) {
      lgs = await Log.aggregate([{$unwind:"$access_log"},{$unwind:"$access_log.referer"},{$unwind:"$access_log.resource"},{$group:{_id:{referer:"$access_log.referer", resource:"$access_log.resource"},"total":{$sum:1}}}, {$match:{"total":{"$gt":1}}},{$match:{"_id.referer":{$ne:null}}},{$project:{"_id.resource":0}}])
    }
    if (req.body.query == 6) {
      lgs = await Log.aggregate([{$match:{$or:[{type:"replicate"},{type:"Served"}]}},{$unwind:"$block"},{$unwind:"$block.block_id"},{$group:{_id:{date:{$substr:["$timestamp",0,10]},blk:"$block.block_id"},uniq:{$addToSet:"$_id.type"}}},{$project:{count:{$size:"$uniq"}}},{$match:{count:{$gt:1}}}])
    }
    if (req.body.query == 7){
      lgs = await Admin.aggregate([{$lookup:{from:"logs",localField:"logs.ref",foreignField:"_id",as:"upvotes"}},{$unwind:"$upvotes"},{$match:{$and:[{"upvotes.timestamp":{$gt:new Date(req.body.startDate)}},{"upvotes.timestamp":{$lt:new Date(req.body.endDate)}}]}},{$group:{_id:{lgs:"$upvotes._id"},total:{$sum:1}}},{$sort:{total:-1}},{$limit:50}]).allowDiskUse(true);
    }
    if (req.body.query == 8){
      lgs = await Admin.aggregate([{$unwind:"$logs"},{$group:{_id:"$_id",numLog:{$sum:1}}},{$sort:{numLog:-1}},{$limit:50}]).allowDiskUse(true)
    }
    if (req.body.query == 9){
      lgs =  await Admin.aggregate([{$lookup:{from:"logs",localField:"logs.ref",foreignField:"_id",as:"upvotes"}},{$unwind:"$upvotes"},{$group:{_id:{lgs:"$_id",srcIps:"$upvotes.source_ip"},total:{$sum:1}}},{$sort:{total:-1}},{$limit:50}]).allowDiskUse(true)
    }
    if (req.body.query == 10){
      lgs =  await Admin.aggregate([{$unwind:"$logs"},{$unwind:"$logs.ref"},{$project:{username:1,email:1,"logs.ref":1}},{$group:{_id:{email:"$email"},total:{$sum:1}}},{$match:{total:1}},{$group:{_id:"$_id.email",upvotes:{$push:{lgs:"$_id.logs.ref"}}}},{$project:{_id:0,upvotes:1}}]).allowDiskUse(true)
    }
    if (req.body.query == 11){
      lgs =  await Admin.aggregate([{$match:{username:req.body.username}},{$lookup:{from:"logs",localField:"logs.ref",foreignField:"_id",as:"upvotes"}},{$unwind:"$upvotes"},{$group:{_id:{blks:"$upvotes.block.block_id"},blocks:{$push:{blk:"$upvotes.block.block_id"}}}}]).allowDiskUse(true)
    } 
    res.json(lgs)
    
  } catch (err) {
      res.status(500).json({ message: err.message })
      return;
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
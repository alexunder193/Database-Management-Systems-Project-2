const express = require('express')
const router = express.Router()
const Admin = require('../models/admin')
const Log = require('../models/log')

//Get all admins
router.get('/', async (req, res) => {
    try {
        const admins = await Admin.find()
        res.json(admins)
    } catch (err) {
        res.status(500).json({ message: err.message })
      }
  })


//Get one Admin
router.get('/:id', getAdmin , async (req, res) => {
    res.json(res.admin)
})

// Create one admin
router.post('/',async (req, res) => {
   let admins = await Admin.find().count();
   if (admins != 0) {
    var lastAdmin = await Admin.find().sort( { _id : -1 } ).limit(1);
    admins=lastAdmin[0]._id;
   }

   
    var arr2 = req.body.logs.sort();
    var newarr = [arr2[0]];
    for(var j=1;j<arr2.length;j++){
      if(arr2[j].ref!=arr2[j-1].ref) newarr.push(arr2[j]);
    }

    req.body.logs = newarr;
    

    var i=1;
    var arr = [];
    for(var key in req.body.logs) {
      console.log(Log.find({_id:req.body.logs[key].ref}).count());
      var obj = req.body.logs[key];
      var flag1 = true;
      let a = Log.find({_id:req.body.logs[key].ref});
      let b = (await a).length;
      if(b == 0){
        flag1 = false;
      }
      if(flag1 == true){
         obj._id = i;
         arr.push(obj);
         i++;
      }
    }

    const admin = new Admin({
        _id: admins+1,
        username: req.body.username,
        email: req.body.email,
        telephone: req.body.telephone,
        logs: arr
    })
    try {
        const newAdmin = await admin.save()
        res.status(201).json(newAdmin)
      } catch (err) {
        res.status(400).json({ message: err.message })
      }
})

// Update one Admin
router.patch('/:id', getAdmin, async (req, res) => {
    if (req.body.username != null) {
         res.admin.username = req.body.username
    }
 	  if (req.body.email != null) {
         res.admin.email = req.body.email
    }
    if (req.body.telephone != null) {
         res.admin.telephone = req.body.telephone
    }
    
    var arr = [];
    for(var key in req.body.logs) {
      var obj = req.body.logs[key];
      var flag = false;
      for(var key1 in res.admin.logs) {
        var obj1 = res.admin.logs[key1];
        if (obj1.ref == obj.ref) {
          flag =true;
          break;
        }
      }
      if (flag == false) {
        arr.push(obj);
      }
    }

    let countLogs1 = res.admin.logs.length;
    let countLogs = res.admin.logs[countLogs1-1]._id;
    countLogs++;
    for(var key in arr) {
          var obj = arr[key];
          obj._id = countLogs;
          countLogs++;
          res.admin.logs.push(obj);
      }
     try {
         const updatedAdmin = await res.admin.save()
         res.json(updatedAdmin)
     } catch {
         res.status(400).json({ message: err.message })
     }
})

// Delete one Admin
router.delete('/:id', getAdmin , async (req, res) => {
     try {
         await res.admin.remove()
         res.json({ message: 'Deleted This Admin' })
       } catch(err) {
         res.status(500).json({ message: err.message })
       }
})

async function getAdmin(req, res, next) {
    try {
      admin = await Admin.findById(req.params.id)
      if (admin == null) {
        return res.status(404).json({ message: 'Cant find Admin'})
      }
    } catch(err){
      return res.status(500).json({ message: err.message })
    }
  
    res.admin = admin
    next()
}

module.exports = router
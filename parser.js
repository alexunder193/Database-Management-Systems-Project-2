const fs = require('fs');
let Log = require('./models/log');
let Block = require('./models/block');
let Destination = require('./models/destination');
let moment = require('moment');
var accessEntries = []
var dataxceiverEntries = []
var dataNameSystem = []
const parser = {
    parseFirstFile() {
        console.log('hello')
    },
    parseAccessLog() {
        let val = 0;
        let counter = 3211731;
        const dataFile = fs.readFileSync('./access.log', 'UTF-8');
        const lines = dataFile.split(/\r?\n/);
        for(let line of lines) {
            val++;
            let data = line.split(" ");
            if(val < 3300001){
                continue;
            }
            if(val == 3353488){
                console.log(accessEntries.length)
                return accessEntries;
            }
            if (!data[7].localeCompare("")) {
                data.splice(7,1);
                let length = data.length;
                data[11] = data[11].substring(1);
                data[length - 2] =data[length - 2].substring(0, data[length - 2].length - 1);
                let ipAddress = data[0];
                let  userId = data[2];
                if (!userId.localeCompare("-")) {
                    userId = null;
                }
                let stringTimestamp = line.substring(line.indexOf("[") + 1, line.indexOf("]"));
                let timestamp = moment(stringTimestamp, 'DD/MMM/YYYY:HH:mm:ss Z').format('YYYY-MM-DD HH:mm:ss');
                let method = data[5];
                method = method.substring(1);
                if (method.length > 10) {
                    continue;
                }
                let resource = data[6];
                let response = null;
                if (data[8].localeCompare("-")) {
                    response = Number(data[8]);
                }
                let size = null;
                if (data[9].localeCompare("-")) {
                    size = Number(data[9]);
                }
                let referer = data[10];
                referer = referer.substring(1);
                referer = referer.substring(0, referer.length - 1);
                if (!referer.localeCompare("-")) {
                    referer = null;
                }
                let userAgent = '';
                for (let i = 11; i < data.length - 1; i++) {
                    userAgent = userAgent.concat(data[i]);
                    if (i != data.length - 2) {
                        userAgent = userAgent.concat(" ");
                    }
                }
                if (!userAgent.localeCompare("-")) {
                    userAgent = null;
                }
                console.log("row = " + val);
                console.log("---------------");
                const log = new Log({
                    _id: counter,
                    source_ip: ipAddress,
                    timestamp: timestamp,
                    type: 'Access',
                    size: size,
                    access_log: {
                        method: method,
                        referer: referer,
                        resource: resource,
                        response: response,
                        user_agent: userAgent,
                        user_id:userId
                    }
                })
                try {
                    accessEntries.push(log)
                    counter++;
                  } catch (err) {
                    console.log(err.message)
                  }
            }
            else {
                let length = data.length;
                data[11] = data[11].substring(1);
                data[length - 2] =data[length - 2].substring(0, data[length - 2].length - 1);
                let ipAddress = data[0];
                let  userId = data[2];
                if (!userId.localeCompare("-")) {
                    userId = null;
                }
                let stringTimestamp = line.substring(line.indexOf("[") + 1, line.indexOf("]"));
                let timestamp = moment(stringTimestamp, 'DD/MMM/YYYY:HH:mm:ss Z').format('YYYY-MM-DD HH:mm:ss');
                let method = data[5];
                method = method.substring(1);
                if (method.length > 10) {
                    continue;
                } 
                let resource = data[6];
                let response = null;
                if (data[8].localeCompare("-")) {
                    response = Number(data[8]);
                }
                let size = null;
                if (data[9].localeCompare("-")) {
                    size = Number(data[9]);
                }
                let referer = data[10];
                referer = referer.substring(1);
                referer = referer.substring(0, referer.length - 1);
                if (!referer.localeCompare("-")) {
                    referer = null;
                }
                let userAgent = '';
                for (let i = 11; i < data.length - 1; i++) {
                    userAgent = userAgent.concat(data[i]);
                    if (i != data.length - 2) {
                        userAgent = userAgent.concat(" ");
                    }
                }
                if (!userAgent.localeCompare("-")) {
                    userAgent = null;
                }
                console.log("row = " + val);
                console.log("---------------");
                const log = new Log({
                    _id: counter,
                    source_ip: ipAddress,
                    timestamp: timestamp,
                    type: 'Access',
                    size: size,
                    access_log: {
                        method: method,
                        referer: referer,
                        resource: resource,
                        response: response,
                        user_agent: userAgent,
                        user_id:userId
                    }
                })
                try {
                    accessEntries.push(log)
                    counter++;
                  } catch (err) {
                    console.log(err.message)
                  }
            }
        };
    
       },

    parseDataXceiver(){
        let val=0;
        let counter=5155779;
        const dataFile = fs.readFileSync('./HDFS_DataXceiver.log', 'UTF-8');
        const lines = dataFile.split(/\r?\n/);
        for(let line of lines) {
            val++;
            let data = line.split(" ");
            if(val < 2250001){
                continue;
            }
            if(val == 2518936){
                console.log(dataxceiverEntries.length)
                return dataxceiverEntries;
            }
            let flag = false;
            for(i=0;i<data.length;i++){
                if(data[i]=="exception"){
                    flag = true;
                    break;
                }
            }
            if(flag==true){
                continue;
            }
            if(data[5]=="writeBlock"){
                continue;
            }
            if(data[3]=="ERROR"){
                continue;
            }
            let strtimestamp = data[0].concat(data[1]);
            let timestamp = moment(strtimestamp, 'DDMMYYHHmmss').format('YYYY-MM-DD HH:mm:ss');
            let blocks = []
            for(i=0;i<data.length;i++){
                if(data[i].startsWith("blk_")){
                    let newblock = new Block({
                        _id:1,
                        block_id: data[i]
                    })
                    blocks.push(newblock)
                }
            }
            let srcPosition = 0;
            let destPosition = 0;
            for(i=0;i<data.length;i++){
                if (!data[i].localeCompare("src:")) {
                    break;
                }
                srcPosition++;
            }
            for(i=0;i<data.length;i++){
                if (!data[i].localeCompare("dest:")) {
                    break;
                }
                destPosition++;
            }
            let destinations = [];
            if(srcPosition == data.length){
                let ipAddress = data[5];
                if(ipAddress.startsWith("/")){
                    ipAddress = ipAddress.substring(1);
                }
                if(ipAddress.includes(":")){
                    ipAddress = ipAddress.substring(0,ipAddress.indexOf(":"));
                }
                let destPos = 0;
                for(i=0;i<data.length;i++){
                    if(data[i] == "to"){
                        break;
                    }
                    destPos++;
                }
                let destAddress = data[destPos+1];
                if(destAddress.startsWith("/")){
                    destAddress = destAddress.substring(1);
                }
                if(destAddress.includes(":")){
                    destAddress = destAddress.substring(0,destAddress.indexOf(":"));
                }
                let type = null;
                if(data[3]=="INFO"){
                    type = data[6];
                }
                if(type == null){
                    continue;
                }
                let size=null;
                if(data[data.length-2] == "size"){
                    size = Number(data[data.length-1]);
                }
                else{
                    size = null;
                }
                newDest = new Destination({
                    _id:1,
                    destination_ip:destAddress
                })
                destinations.push(newDest);
                counter++;
                const log = new Log({
                    _id: counter,
                    source_ip: ipAddress,
                    timestamp: timestamp,
                    type: type,
                    size: size,
                    destination:destinations,
                    block: blocks
                })
                try {
                    dataxceiverEntries.push(log)
                  } catch (err) {
                    console.log(err.message)
                  }
            }
            // if src exists
            else{
                let ipAddress = data[srcPosition+1];
                let destAddress = data[srcPosition+1];
                if(ipAddress.startsWith("/")){
                    ipAddress = ipAddress.substring(1);
                }
                if(ipAddress.includes(":")){
                    ipAddress = ipAddress.substring(0,ipAddress.indexOf(":"));
                }
                if(destAddress.startsWith("/")){
                    destAddress = destAddress.substring(1);
                }
                if(destAddress.includes(":")){
                    destAddress = destAddress.substring(0,destAddress.indexOf(":"));
                }
                let type = data[5];
                if(data[data.length-2] == "size"){
                    size = Number(data[data.length-1]);
                }
                else{
                    size = null;
                }
                newDest = new Destination({
                    _id:1,
                    destination_ip:destAddress
                })
                destinations.push(newDest);
                counter++;
                const log = new Log({
                    _id: counter,
                    source_ip: ipAddress,
                    timestamp: timestamp,
                    type: type,
                    size: size,
                    destination:destinations,
                    block: blocks
                })
                try {
                    dataxceiverEntries.push(log)
                  } catch (err) {
                    console.log(err.message)
                  }
            }
            console.log("row = " + val);
            
        }
    },

    parseNameSystem()  {
        const dataFile = fs.readFileSync('./HDFS_FS_Namesystem.log', 'UTF-8');
        const allLines = dataFile.split(/\r?\n/);
        let lines = 0;
        let c=5444270;
        for (let line of allLines) {
            lines++;
            if(lines < 20000){
                continue;
            }
            if(lines == 28786){
                console.log(dataNameSystem.length)
                return dataNameSystem;
            }
            let data = line.split(" ");
            let stringTimestamp = data[0].concat(data[1]);
            let timestamp = moment(stringTimestamp, 'DDMMYYHHmmss').format('YYYY-MM-DD HH:mm:ss');
            let sourceIp = data[7];
            if (sourceIp.includes(":")) {
               sourceIp = sourceIp.substring(0, sourceIp.indexOf(":"));
            }
            let type = data[9];
            var flag = false;
            var ipPos2 = 0;
            for (let s of data) {
              if (s.includes("datanode(s)")) {
                flag = true;
                break;
              }
              ipPos2++;
            }
            var destinations = [];
            if (flag == true) {
                var counter =1;
                for (let i = ipPos2 + 1; i < data.length; i++) {
                    let destIp = data[i];
                    const destination = new Destination({
                        _id: counter,
                        destination_ip: destIp
                    })
                    destinations.push(destination);
                    counter++;
                }
            }
            var blocks = [];
            var counter1 =1;
            for (let s of data) {
              if (s.includes("blk_")) {
                const block = new Block({
                    _id: counter1,
                    block_id: s
                })
                blocks.push(block);
                counter1++;
              }
            }
            const log = new Log({
                _id: c,
                source_ip: sourceIp,
                timestamp: timestamp,
                type: type,
                destination: destinations,
                block: blocks
            })
            c++;
            try {
                dataNameSystem.push(log)
              } catch (err) {
                console.log(err.message)
              }
              console.log('----------------')
              console.log(lines)
        }
        
      }


}

module.exports = parser
let Admin = require('./models/admin');
var faker = require('faker');
var data = []
var l=5253001;
const adminData = {
    generateFakeData() {
       // console.log('hello')
       // console.log(faker.internet.userName())
       // console.log(faker.internet.email())
       // console.log(faker.phone.phoneNumber())    
        for(i=1800001;i<=2000000;i++){
            var k=1;
            lgs = [{_id:k,ref:l},{_id:k+1,ref:l+1},{_id:k+2,ref:l+2}]
            const admin = new Admin({
                _id: i,
                username:faker.internet.userName(),
                email:faker.internet.email(),
                telephone:faker.phone.phoneNumber(),
                logs: lgs
            })
            data.push(admin);
            console.log(i);
            l++;
        }
        return data;
    }


}

module.exports = adminData
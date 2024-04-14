const mongoose = require('mongoose');

const initMongoConnection = (mongoUri) => {
    console.log("Connecting to MongoDB...")
    mongoose.connect(mongoUri, {
    }).then((res, err)=>{
        if(err) return console.log(err);
        if(res) return console.log('Connected to MongoDB')
    })
}

module.exports = initMongoConnection;
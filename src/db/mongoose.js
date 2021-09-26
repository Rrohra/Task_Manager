
const mongoose = require('mongoose')         //in mongoose the mongodb plays behind the scenes


//same as mongoddb.connect . useCreateIndex : true will ensure the indexes are created when mongoose works with mongodb
mongoose.connect(process.env.MONGODB_PATH, { 
    useNewUrlParser: true, 
    useCreateIndex: true,
    useUnifiedTopology: true 
})





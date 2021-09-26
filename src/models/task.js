//thi sis the model for task

const mongoose = require('mongoose')         //in mongoose the mongodb plays behind the scenes
const validator = require('validator')       //library for validation


const taskSchema = new mongoose.Schema({
    name: {
        type : String
    },

    completed:{
        type : Boolean,
        required : true,
        default : false
    },

    description:{
        trim :true,
        type: String
    },

    /*owner:[{
        name:{
            type:String,
            required : true
        },
        owner_id:{
            type: mongoose.Schema.Types.ObjectId,                     //read more about it, why not straightforward ObjectId
            required: true,
            ref : 'user'                                                //reference for USER-TASK relation 
                                                                        //(jo model name hai user ka , not the name that user exports)
                                                                        //this will allow to fetch the entire user , jiska task hai
        }
    }]*/

    owner:{
        type: mongoose.Schema.Types.ObjectId,                               //aisa hi hota hai.
        required: true,
        ref: 'user'                                                        //jo naam model ke name mein rakha hau under single quotes
    }
},{
    timestamps : true
})


const Task  =mongoose.model('task', taskSchema)
module.exports = Task
//thi sis the model for USer

const mongoose = require('mongoose')         //in mongoose the mongodb plays behind the scenes
const validator = require('validator')       //library for validation
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sharp = require('sharp')             // this librabry enables us to crop and edit images before sending to client/postman
const Task = require('../models/task')    //to delete all the user's task once user is deleted
//now we will build models . Accepts two arguments String name for model , definition - which defines all the fields we want
/*const User =mongoose.model('user',{
    name :{
        type : String,
        required : true,
        validate(value){                          //custom validation by mongoose
            if(value[0] === 'K')
            {
                throw new Error("names with K not allowed")
            }
        }
    }, //name is the property and its value will be stored as an object
    email:{
        type: String,
        required : true,
        trim : true,
        lowercase : true,
        unique : true,                                             //unique email aaega
        validate(value){
            if(!validator.isEmail(value)){                          //true if email is appropriate 
                throw new Error("Email is not valid")
            }
        },
        trim: true                                             //removes spaces before and after
        
    },
    age :{
        type :Number,  //these are constructor functions from javascript as a value to type.
        validate(value){                          //custom validation by mongoose
            if(value < 0)
            {
                throw new Error("Age must be a postive number")
            }
        }
    },
    password :{
        type:String,
        required : true,
        trim :true,
        validate(value){
            if(value.length <6 || value.toLowerCase().includes('password'))
            {
                throw new Error("Please enter password more than 6 char and 'password' is not allowed")
            }
        }
    }

})
//above "User" is the constructor fucntion for the model)
*/




//-----------------------------------------code after schema -------------------------------------- */
//--------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------



//using middleware to help write fucntions to execute before or after mongoose fucntions
const userSchema = new mongoose.Schema({
    name :{
        type : String,
        required : true,
        validate(value){                          //custom validation by mongoose
            if(value[0] === 'K')
            {
                throw new Error("names with K not allowed")
            }
        }
    }, //name is the property and its value will be stored as an object
    email:{
        type: String,
        required : true,
        trim : true,
        lowercase : true,
        unique : true,                                             //unique email aaega
        validate(value){
            if(!validator.isEmail(value)){                          //true if email is appropriate 
                throw new Error("Email is not valid")
            }
        },
        trim: true                                             //removes spaces before and after
        
    },
    age :{
        type :Number,  //these are constructor functions from javascript as a value to type.
        validate(value){                          //custom validation by mongoose
            if(value < 0)
            {
                throw new Error("Age must be a postive number")
            }
        }
    },
    password :{
        type:String,
        required : true,
        trim :true,
        validate(value){
            if(value.length <6 || value.toLowerCase().includes('password'))
            {
                throw new Error("Please enter password more than 6 char and 'password' is not allowed")
            }
        }
    },
    tokens :[{                                                           //this is used for user to log out and track token
        token :{
            type:String,
            required:true
        }
    }],
    avatar:{
        type : Buffer
    }


}, {
    timestamps: true
})


//USER -TASk relation for finding all task associated with Users
userSchema.virtual('tasks', {
    ref : 'task',                                                  //model name , not the export name
    localField : '_id',                                         //Yeh user model ka user ka id
    foreignField : 'owner'                                      //yeh task model ka field
})

//middleware
userSchema.statics.findByCredentials = async(email, password) =>{
    const user =await User.findOne({
        email : email
    })

    if(!user){
        throw new Error('unable to log in')                               //error phekega as a promise
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user                                                 //if error not sent toh user bejega as a promise
}



//middleware
userSchema.methods.generateAuthToken = async function(){    //methods are accessible on instances, statics are accessible on models 
                                                            //ex: User is a model, const user = USer... , here 'user' is an instance
    const user = this
    const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_SECRET_STRING)  //_id is an ObjectId , we need to stringify it
    
    user.tokens = user.tokens.concat({token})                       //concat the token generated in the tokens array defined in the model
    await user.save()                                                 //save the token to db
    return token

}


//middleware toJSON() fucntion called on schema before sendingg the response(res) to client i.e is to delete unrequired fields from database while sending response json
/*userSchema.methods.getonlypublicinfo =function(){
    const user  = this
    const userObject  = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject                                //return is necessary
}*/
//or we can use shortcut , as uper wale ke sath har bar user.getinlypublicinfo() call karna padega in router ,niche wala automatic hai
userSchema.methods.toJSON =function(){
    const user  = this
    const userObject  = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar                           //we dont want avatar to be deiplayed in read logged in user
    return userObject 
}//logic written in book


//thus now we can use ' pre' and 'post' fucntions to userSchema before executign functions like 'save' and 'validate'
//Hash the plain text password, before saving the user in the datatbse (middleware)
userSchema.pre('save',async function(next){         // we can use arrow fucntion a arroe doestn bind 'this' keyword
    const user = this                                   //'this' keyword gives access to each user that is about to be saved
    
    console.log("hi there this is hashcode")
    if(user.isModified('password')){                    //this will be true when user is created and when while updating passowrd is provided
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()                                         // the code will then save the user after next is called.
                                                    // if not called , the script will hang
})


//middleware
//Delte all the user tasks once the user is deleted
userSchema.pre('remove',async function(next){
    const user = this

    await Task.deleteMany({owner : this._id})
    //console.log("delete preschgema works")
    next()
})



const User =mongoose.model('user', userSchema)         //always add userSchema in the end of all the statics and methods , warna woh kaam nahi karenge
//thus the above model willl take the userschema as the model and we can perform middleware

module.exports = User                            //we need to export this so other files such as index.js can use the models
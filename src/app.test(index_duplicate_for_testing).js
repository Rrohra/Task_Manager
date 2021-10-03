//basicall in testing we are gonna use SUPRT_TEST library to test along with JEST
//in SUper Test library , we dont need app.listen that si called in index.js
//so we will reqrite index.js here and not include app.listen method

//now the trick is , as we are duplicating the code , why not export the code from here into the index,js to reduce code duplication
//and there only app.listen will be present

const express =require('express')
require('./db/mongoose')                                        //this ensures the mongoose runs and is connected to database 
const User = require('./models/user')                           //loading the user model in User variable
const Task = require('./models/task')
const userRouter =require('./routers/user_router')
const taskRouter = require('./routers/task_router')
const jwt =require('jsonwebtoken')

const app = express()      //new application
const port = process.env.PORT


app.use(express.json())    
app.use(userRouter)                      //register the user router with App
app.use(taskRouter)


module.exports = app                       //yeh index.js mein code bejega
                                            //wahan pe sirf listen aur port rahega 


//thus when we watn to run this code in develoipment mode , we will use index.js and when we want to test , we this file.
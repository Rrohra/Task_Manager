//this is the starting point of TASK MANAGER APPLICATION

const express =require('express')
require('./db/mongoose')                                        //this ensures the mongoose runs and is connected to database 
const User = require('./models/user')                           //loading the user model in User variable
const Task = require('./models/task')
const userRouter =require('./routers/user_router')
const taskRouter = require('./routers/task_router')
const jwt =require('jsonwebtoken')

const app = express()      //new application
const port = process.env.PORT  // process.env.PORT is an environment vaiable and is automatically supplied by heroku when hosted


/*//middleware , needs to be above all app.use() calls
app.use((req, res, next)=>{                             //req and res are common to route handlers, next is specific to middleware
    console.log(req.method, req.path)                    //(http method , route url)

    if(req.method)
    {
        res.send("gm")
    }
    else{
    next()}                                               // nahi call kiya toh do something phase se aage nahi badegi gaadi
})*/


//A two step process to automatically parse the incoming json so that we can use it as an object and create resource
app.use(express.json())              //customise our server. it will automatically parse all the incoming data to an object


/*/create a new router (part of refactoring the code)
const router = new express.Router()


router.get('/test', (req, res)=>{
    res.send("hello")
})
app.use(router)                          //we register the router with our App*/


app.use(userRouter)                      //register the user router with App
app.use(taskRouter)


//---------------------------------TASK USE RRELATION-----------------------------
//---------------------------------------------------------------------------------
//----------------------------------------------------------------------------------
/*const main= async()=>{
    //find  the user details associated with task
    const task = await Task.findById('613b305c6ab8420c1cd123d4')
    //the following line will populate the owner field in task model  , as ref is defined in owner
    //await task.populate('owner.owner_id').execPopulate()    => for owner [name , owner_id]

    await task.populate('owner').execPopulate()            //  => for owner{}
    console.log(task.owner)



    //find all tasks associated with USer
    const user =await User.findById('6134e655292c5b3d84cb61db')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)                                       //user.tasks ,bole toh tasks is virtual field
                                                                    //usko return kar rahe

}

main()*/


//----------------------File upload --------------------
//--------------------USE of MULTER -------------------
//api : localhos:3000/upload
const multer= require('multer')
const upload = multer({                                     //configuring multer
    dest : 'images',                                         //this is the folder where all the files will be saved (destination)
    limits :{
        fileSize : 1000000                                 //max file size upload in bytes
    },

    fileFilter(req, file, cb){
        /*cb(new Error(" File must be of this type <>"));      //cb is acallback , here this example throws error
        cb(undefined , true)                                  //accept the file
        cb(undefines, false)*/                                //reject

        //we can use the below or regex.
        if(!file.fileFilter.originalnameendswith('.pdf')){          //this crosschecks the file to accept only pdf 
            return cb(new Error('Please upload a pdf file'))      
        }
        cb(undefined, true )                                       // if pdf accept the task

        //regex wala solution
        if(!file.fileFilter.match(/\.(doc|docx)$/))             //usign regex in /....../
        {
            return cb(new Error('Please upload a word file'))      
        }
        cb(undefined, true )
    }
})
//now we will create an endpoint so that client can upload a picture

app.post('/fileupload', upload.single('update'),  (req, res)=>{        //yahanpe single mein jo value stored hai 
                                                                        //wahich value as a key store karni hai in postman-> body -> form-data
    res.send()
})




app.listen(port, ()=>{                              //as listen() is asynchronous, hence callback
    console.log("Server is up on port: "+ port)
})




//---------express middleware explanation (it is needed for client validation on accessing authenticated routes)--------
//------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
//
//without middleware  : new request - > see app.uses route -> go to route-> perform the actions so on
//
//with middleware##  :  new reuqest -> **do something** -> see app use router -> go to route -> perform the actions so on
//
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------



//code before router
/*
app.post('/tasks', async(req,res)=>{
    const task = new Task(req.body)

    try{
        await task.save()
        res.status(200).send(task)
    }catch(e){
        res.status(400).send(e)
    }
    /*task.save().then((result)=>{
        res.send(result)
    }).catch((error)=>{
        res.status(400).send(error)
    })*//*
})





app.get('/tasks',async(req,res)=>{

    try{
        const task = await Task.find({})            // if this runs , means response got fulfilled
        res.status(200).send("Not found")
    }catch(e){
        res.status(400).send(e)
    }

    /*Task.find({}).then((result)=>{
        res.send(result)
    }).catch((err)=>{
        res.status(400).send(err)
    })*//*
})


app.get('/tasks/:id', async(req,res)=>{

    const _id = req.params.id
    console.log(req.params)                                  //koi bi number in url .../task/3245345.. {id : 3245345...}aisa aata hai 
    
    try{
        const task = await Task.findById(req.params.id)
        if(!task){
            res.status(400).send("Not found")
        }
        res.status(200).send(task)
    }catch(e){
        res.status(400).send(e)
    }
    /*Task.findById({                                            
        _id : _id                                           // we didnt convert string ids to ObjectId ,mongoose does it itself
    }).then((result)=>{
        if(!result){
            return res.status(404).send("not found")                   //user not found
        }
        res.send(result)
    }).catch((error)=>{
        res.status(500).send(error)                           //internal server error
    })*//*
})



//task update endpoint
//attempt to update task , handle task not found, handle validation errors, handle success
app.patch('/tasks/:id', async(req,res)=>{

    //wrong update
    const allowedUpdates_task = ['name','completed','description']
    const updates = Object.keys(req.body)
    const isvalidupdate = updates.every((update)=>{     //return true if all present , else false
        return allowedUpdates_task.includes(update)     
    })

    if(!isvalidupdate)
    {
        return res.status(400).send("Invalid update")
    }
    try{
        const task = await Task.findByIdAndUpdate(req.params.id,req.body, {new: true, runValidators: true} )
        if(!task){
            return res.status(400).send("Not found")
        }
        console.log("rphit")
        res.status(200).send(task)
    }catch(e){
        console.log("rohit")
        res.status(400).send(e)
    }
})




app.delete('/tasks/:id', async(req,res)=>{
    try{
        const task =await Task.findByIdAndDelete(req.params.id)
        if(!task){
            return res.status(400).send("task not found")
        }
        res.status(200).send(task)
    }catch(e){
        res.status(404).send(e)
    }
})


*/







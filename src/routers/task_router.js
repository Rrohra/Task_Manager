const express = require('express')
const auth = require('../middleware/auth_middleware')
const router =new express.Router
const Task =require('../models/task')
require('../db/mongoose')


//1) create
router.post('/tasks', auth ,async(req,res)=>{
    //const task = new Task(req.body)                       before relation with user

    //after relation with user - 
    const task = new Task({
        ...req.body,                                      //es 6 method to take everything provided by user in postman/clientside body
        //owner : {name: req.user.name, owner_id:req.user.id }     // => for owner [name , owner_id]
        owner : req.user._id                                          // = >for owner
    })
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
    })*/
})




//2) read
//tasks?status =true/ false
//tasks?limit=10&skip=20                    //mane 3rd page. har page mein 10.
//tasks?sortby= createdAt_desc/asec or sortby=createdAt:desc/aesc
router.get('/tasks',auth ,async(req,res)=>{
    const status = {}                                //empty constant for displaying compelted specific tasks
    const sort = {}                                 //this ssotres the variable and valuer for sorting  ex: createdAt : 1 /-1
    if(req.query.status){
        status.completed = req.query.status==='true'   //thing is hum url se true as a string bejenge, not a boolean 
                                                    // if that string equals to 'true', tab jaake status == boolean(true set hoga)
                                                    // also try : Boolean.parseBoolean("true")
    }

    if(req.query.sortBy){                       //why we not directly using sort as limit/skip.
                                                    //becuase we need to modify the info first adn {..} yeh bracket pass karna hai as we not sure konse parameter ke hisaab se sort lagana hai
        const parts = req.query.sortBy.split(':')
        /*sort[parts[0]] = (parts)=>{
            if(parts[1]==='desc'){
                return -1
            }
            else{return 1 }
        }
        //sort[parts[0]]               How to call this. Ask rajeev.
        console.log(sort)*/
        //alternative - ternary operator
       sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
       console.log(sort)
    }


    try{
        //const task = await Task.find({owner : req.user._id, completed :status.completed })            // if this runs , means response got fulfilled
        //above not working when boolean is not provided.
        
        //alternate :
        await req.user.populate({
            path : 'tasks',
            match : status.completed,                               //this is for dispalying completed status specific tasks
        
            options :{
                limit : parseInt(req.query.limit),        //pagination setting , if limit or skip provided in url
                                                            //to hi consider hoga warna skip
                skip : parseInt(req.query.skip),
                /*testing _sort: {
                    createdAt : -1                       //sortby createdAt in desceinding
                }*/

                sort                                      //es6 syntax warna sort : sort --> referijng to above created const sort ={}

            }
        }).execPopulate()
        res.status(200).send(req.user.tasks) //or req.user for everything
        //res.status(200).send(task)
    }catch(e){
        res.status(400).send(e)
    }

    /*Task.find({}).then((result)=>{
        res.send(result)
    }).catch((err)=>{
        res.status(400).send(err)
    })*/
})


router.get('/tasks/:id',auth , async(req,res)=>{

    const _id = req.params.id
    console.log(req.params)                                  //koi bi number in url .../task/3245345.. {id : 3245345...}aisa aata hai 
    
    try{
        //const task = await Task.findById(req.params.id)
        const task = await Task.findOne({ _id, owner : req.user._id})    //owner ka id shoudl match user ka id , jo auth se aaega

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
    })*/
})





//3) update
//task update endpoint
//attempt to update task , handle task not found, handle validation errors, handle success
router.patch('/tasks/:id', auth ,async(req,res)=>{

    //middleware : wrong update
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
        //below is non middleware update
        //const task = await Task.findByIdAndUpdate(req.params.id,req.body, {new: true, runValidators: true} )
        
        //below is the middleware( : wrongupdate) included update
        /*const task = await Task.findById(req.params.id)
        updates.forEach((update)=>{
            task[update] = req.body[update] 
        })
        await task.save()*/

        //below is middleware : n=wrongupdate  + middleware:auth included update
        const task = await Task.findOne({_id :req.params.id, owner: req.user._id})
        if(!task){
            return res.status(400).send("Not found")
        }
        updates.forEach((update)=>{
            task[update] = req.body[update] 
        })
        await task.save()

        
        console.log("rphit")
        res.status(200).send(task)
    }catch(e){
        console.log("rohit")
        res.status(400).send(e)
    }
})





//4) delete
router.delete('/tasks/:id',auth, async(req,res)=>{
    try{
        const task =await Task.findOneAndDelete({_id : req.params.id, owner : req.user._id})    //deleteOne dowesnt return promise, toh 400 trugger nahi hoga for loopss mein

        if(!task){
            return res.status(400).send("task not found")
        }
        res.status(200).send(task)
    }catch(e){
        res.status(404).send(e)
    }
})


module.exports = router
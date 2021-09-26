const express = require('express')
const router = new express.Router()
const User  = require('../models/user')
const bcrypt = require('bcryptjs')
//express middleware loading 
const auth =require('../middleware/auth_middleware')       // we will add them to routes where we want to add authentication (all except sign up / log in)
//const Task = require('../models/task')        // //to delete all the user's task once user is deleted(depreciated : handled u=in user model in middleware)
const multer  =require('multer')                         //for file upload
const sharp = require('sharp')
const {sendWelcomeEmail, sendByeByeEmail} = require('../emails/account')     //es6 destructuring to directly fetch the exported function.

require('../db/mongoose')
//creating routes / endpoints

//1) creating resources rest api
router.post('/users', async(req,res)=>{                //users tab pe on clicking something post fire hoga
    const user =new User(req.body)

    try{
        await user.save()                           //if async await ka promise gets fulfilled , try will run. save() is an inbuilt fucntion , jo model ko save karega , User constructor hai , user is the instance
        await sendWelcomeEmail(user.email, user.name)   // .send() is an async method , return s a promise
        
        //middleware
        const token = await user.generateAuthToken()      //generate the token for just signed up user and send it back in response
                                                        //so user dont have to login again after signup

        res.status(201).send({user , token})                      //else catch //thise sends the extra token into the response jo apan extract karke set karte hai.
    }catch(e){
        res.status(400).send(e)
    }
    

    /*user.save().then((result)=>{
        res.send(result)
    }).catch((error)=>{
        res.status(400).send(error)       //just to set the status
    })*/
})                                        //to create resource(user / task)






//2) reading resources rest api (we added auth as the express middleware to provide user authentication, thus auth file pehle chalega, if yeh wala route access hota hai toh)

router.get('/users/me', auth ,async(req,res)=>{
    /*const getAllUsers = new User()
    getAllUsers.find().then((result)=>{ 
        res.send(result)
    }).catch((error)=>{
        res.status(400).send(error)
    })*/ 
                                             // wont work use the below
    /*try{
        const users = await User.find({})
        res.status(200).send(users)
    }catch(e){
        res.status(400).send(error)
    }*/                                          // we dont want the user to see details of other user hence we will change the route
    
    /*User.find({}).then((result)=>{
        res.send(result)
    }).catch((err)=>{
        res.status(400).send(err)
    })*/

    res.send({"Message " :"Hi "+req.user.name.substr(0,1).toUpperCase()+  req.user.name.substr(1), "user": req.user})                              //since auth mein we are setting the user , and this route will run only if user is authenticated
})


// 2.1) reading a user by id
//we dont need this to perform as its only for development phase not actual project. logged in ho to hi user details dikhega which above fucntion is fperforming
/*router.get('/users/:id', async(req,res)=>{


    const _id = req.params.id

    try{
        const user = await User.findById(req.params.id)
        if(!user){
            return res.status(400).send("Not found")
        }
        res.status(200).send(user)
    }catch(e){
        res.status(400).send(e)
    }
    //console.log(req.params)                                  //koi bi number in url .../user/3245345.. {id : 3245345...}aisa aata hai 
    /*User.findById({                                            
        _id : _id                                           // we didnt convert string ids to ObjectId ,mongoose does it itself
    }).then((result)=>{
        if(!result){
            return res.status(404).send()                   //user not found
        }
        res.send(result)
    }).catch((error)=>{
        res.status(500).send(error)                           //internal server error
    })*/
//})*/









//3)*********Updating the resource

router.patch('/users/me',auth, async(req,res)=>{      
    //const _id = req.params.id        //not necessary , was rewuired when update by id
    //any of the properties not there in database , will be ignored, hence to handle it
    const updates = Object.keys(req.body)     //keys will return an array of string which we will use to compare below allowed updates
    const allowedUpdates = ['name','email','password','age']
    
    const isValidOperation = updates.every((update)=>{      //every runs for each itme in updates, return true if all pass the condition or else false
        return allowedUpdates.includes(update)                //includes see if that item is present in allowedUpdates , if all yes true, or false
    })
    //console.log(isValidOperation)
    if(!isValidOperation)
    {
        return res.status(404).send("Invalid updates made")
    }
    try{

        //the following update line will by pass the middleware hence we need somethign else to use the save() and userSchema 'pre'
        //const user = await User.findByIdAndUpdate({_id}, req.body, {new: true, runValidators: true})      //await to get the promise from User.findByIDAnd Update, await bas promise chaining ka simplified version hai . Then catch wagera calling api mein use hoga, jo hum filhaal postman mein likj=h rahe hai.
        
        
        //to use middleware , we will modify the update as follows
        //const user = await User.findById({_id})            //not required was necessary for update by id
        updates.forEach((update)=>{                         //idhar apan updates array ke upar for loop chala ke particular fields mein data store kiya
            req.user[update] = req.body[update]
        })

        await req.user.save()               // thus we now can use the middleware   

        
        /*if(!user){
            return res.status(404).send()  
        }*/                                                    //not required as already handled in auth_middleware
        res.status(200).send("Hi " + req.user.name.substr(0,1).toUpperCase()+  req.user.name.substr(1)+ ". We have updated the changes requested as follows : -" + req.user )


    }catch(e){
    res.send(400).send(e)
    }
})











//4)******************  Delete operations 

router.delete('/users/me', auth , async(req, res)=>{
    try{
        /*const user = await User.findByIdAndDelete(req.params.id) //new : tru nahi hoega kyunki pehle ka input chiayue
        if(!user){
            res.status(400).send("User not found")
        }*/// this is for delete by id                         //user not found is handled in auth_middleware

        await req.user.remove()  //isntead of passing id of req.user in above findbyidanddelete code, 
                                //we use inbuilt mongoose fucntions

        //console.log("delete api works")
        //await Task.deleteMany({owner : req.user._id})  //this lins is to delete all the tasks created by that uer
                                                        //once tg=hat user is deleted , instead 
                                                        //we will use middleare : user.js (model) to delete the tasks.
        await sendByeByeEmail(req.user.email, req.user.name)
        res.status(200).send("We are sorry to see you go "+ req.user.name.substr(0,1).toUpperCase()+  req.user.name.substr(1) +". Please Come again")                              //"cooment" + user  = gives invalid status code {try it someday}
    }catch(e){
        res.status(400).send(e)
    }
})









//5) LOG IN with their existing account
//------------user will provide crredentials and the job of the route will be to verify them-------
//post because data user bejega na saamne se to log in

router.post('/users/login', async(req,res)=>{
    //approach 1
    /*const email = req.body.email
    const password = req.body.password
    try{
        const user = await User.findOne({email : email})
        const hashed_stored = await bcrypt.hash(user.password,8)
        const istrue = await bcrypt.compare(password,hashed_stored)
        if(istrue)
        {
            res.status(200).send("Hi " +user.name + user)
        }
        res.status(400).send("cannot find the user")
    }catch(e)
    {
        res.status(400).send(e)
    }*/


    //Approach 2 - make a reusabke function in the user model
    try{
        //middleware check if user exists , then log in 
        const user =await User.findByCredentials(req.body.email , req.body.password)                //note the findByCredentials is a custom fucntion
        //uper wala fucntion yaan toh error throw karega , yaan user . Error throw kiya toh niche catch pakad lega , or else user hai toh we ll return
        
        //middleware token genration
        const token = await user.generateAuthToken()               //thus we call generateAuthToken on particular 'user' , which will return a token from model
        
        res.status(200).send({"Message " :"Welcome back " + user.name.substr(0,1).toUpperCase()+  user.name.substr(1), "user": user,"token": token})    //this token comes from above generated , not from db , neither from auth_middleware
    }catch(e)
    {
        res.status(400).send("Password is wrong")
    }

})

//6) *******  LOG OUT ******************
//user has to logout of the current particular token 
router.post('/users/logout', auth, async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((t)=>{
            console.log(t.token)
            return t.token !== req.token           //as the "t" in iterator has 2 fields = id,token(see studio3T),
                                                // so we match adn return all tokens not equal to current
          
        })
        await req.user.save()
        res.status(200).send(req.user +"Logged out")     //agar + logge out nikal denge toh passwrod wagera delete marega, while displaying
                                                        //basically toJson defined in user.js function will be called 
    }catch(e)
    {
        console.log(e)
        res.status(400).send("Unable to log out")
    }
})


//******** 7)LOGOUT of all USERS i.e. ALL TOKENS ********************/
//we user req.user instead of 'user' as auth se user aaraha hai , refewr auth fucntion
router.post('/users/logout_all_user_instances', auth, async(req, res)=>{
    try{
        /*req.user.tokens = req.user.tokens.filter((t)=>{
            return false
        })*/
        //or we can run below line 
        req.user.tokens =[]

        await req.user.save()
        res.status(200).send("All instances logged out " + req.user)
    }catch(e){
        console.log(e)
        res.status(400).send("Unable to log out of all USERS")
    }
})

module.exports = router




// ************************************8) File  Upload (User Profile Picture)Endpoint ******************************
// *************************************************************************************
//middleware
const config_multer = multer({
    //dest : 'User_Profile_Pictures',                    // yeh naam ka folder banega (commented to save the picture in user model) 
    limits:{
            fileSize : 1000000                        //max file size 1 MB
    },
    fileFilter(req, file, cb){                                     //this is not a property but a fucntion
            if(!file.originalname.match(/\.(jpg|png|gif|jpeg)$/)){           //regex is used so only jpg/png/jpeg.gif files can be uploaded
                return cb(new Error('Please upload a PDF'))
            }
            cb(undefined, true )                          //way to accept the file
            //cb(undefined, false)                        //way to silently reject a file
            //cb(new Error('sdvdv'))                      //way to noisely reject a file
    }
})


//route to upload a file/user- profule image
router.post('/users/me/upload_profile_picture',auth,config_multer.single('picture'), async (req, res)=>{        //we have eparate request for uploading the picture as we are not sending Json data we are sending BODY - > form -data
                                                                                                        //we have to register config_multer.single as the middleware
                                                                                                         //yahanpe single mein jo value stored hai 
                                                                                                         //wahich value as a key store karni hai in body -> form-data

    //req.user.avatar = req.file.buffer                                                               //tells express to store the buffer of file in multer object into the avatar of user in user model(req.user auth se aaya hai)
    const sharp_applied = await sharp(req.file.buffer).resize({width: 250 ,height: 250}).png().toBuffer()    //modifies the image uploaded by the user/client/postman
    req.user.avatar = sharp_applied
    await req.user.save()
    res.send("Hey You look Fab !")
},(error, req, res, next) =>{                                                                       //this tells express to handle any uncaught errors
        res.status(400).send({error : error.message})
})

//route to delete the user profile image
router.delete('/users/me/delete_profile_picture',auth, async(req,res)=>{
    try{
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send("Profile picture removeed successfully")
    }catch(e){
        res.status(400).send("Error deletign the profile picture")
    }
})


//route to get the profile picture as per the ID provided by the user
router.get('/users/:id/get_profile_picture',async(req, res)=>{
    try{
    const user =await User.findById(req.params.id)

    if(!user || !user.avatar)                                                 //to check if there is user and user avatar field
    {
        throw new Error()
    }

    res.set('Content-type','image/png')                                       //setting the header for response, as we want to display image 
    const picture = user.avatar
    res.status(200).send(picture)
    }catch(e){
        res.status(400).send("error retrrieving the image" + e)
    }
})

//------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------
//                                     NOTES   
//------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------

//1) user.getonlypublicinfo()   == basically cutsoff of password and other hidden information
//    before sending it off to client. The fucntion is defined in user.js
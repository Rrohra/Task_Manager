///this is the express middleware to vaidate the user while accessing different routes

const jwt = require('jsonwebtoken')
const User = require('../models/user')


const auth = async(req, res, next)=>{
    console.log("middleware works")
    try{
        const token = req.header('Authorization').replace('Bearer ','')   //we want to remove the bearer and space in header.
        console.log(token)
        const decoded = jwt.verify(token, process.env.JWT_SECRET_STRING)         //we verify the token with the secret string , means whether we have generated token in our system or not
        const user =await User.findOne({_id : decoded._id, 'tokens.token':token}) //we cross check the id with the id of decoded token - to identify the user. then we check the token with users token to check if the token is expired or that users token is only passed
    
        if(!user){
            throw new Error()
        }

        req.token =token
        req.user = user                                         //so that the routes dont have to fetch user details again and again
        next()
    }catch(e){
        console.log(e)
        res.status(401).send({Error : 'Please authenticate'})
    }
    
}

module.exports = auth
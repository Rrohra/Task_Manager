//this has the setup code to set the test user for testing

const User = require('../../src/models/user')  //beforeEach and afterEach
const jwt =require('jsonwebtoken')
const mongoose = require('mongoose')
const Task = require('../../src/models/task')

const test_user1Id = new mongoose.Types.ObjectId()   //this is for token testing
const test_user1 = {
    _id : test_user1Id,
    name : "Test_user1",
    email: "test_user1@gmail.com",
    password : "Test@user1",
    tokens:[{
        token : jwt.sign({_id:test_user1Id.toString()}, process.env.JWT_SECRET_STRING)
    }]
}

const test_user2Id = new mongoose.Types.ObjectId()   //this is for token testing
const test_user2 = {
    _id : test_user2Id,
    name : "Test_user2",
    email: "test_user2@gmail.com",
    password : "Test@user2",
    tokens:[{
        token : jwt.sign({_id:test_user2Id.toString()}, process.env.JWT_SECRET_STRING)
    }]
}

const test_task1 = {
    _id : new mongoose.Types.ObjectId(),
    name : 'test_task1_user1',
    description : "for testing",
    completed : false,
    owner: test_user1._id
}

const test_task2 = {
    _id : new mongoose.Types.ObjectId(),
    name : 'test_task2_user2',
    description : "for testing",
    completed : false,
    owner: test_user2._id
}

const test_task3 = {
    _id : new mongoose.Types.ObjectId(),
    name : 'test_task1_user1',
    description : "for testing",
    completed : true,
    owner: test_user1._id
}


const setupDatabase_before_test = async()=>{        //required for user_test 
    await User.deleteMany()
    await Task.deleteMany()
    await new User(test_user1).save()
    await new User(test_user2).save()
    await new Task(test_task1).save()
    await new Task(test_task2).save()
    await new Task(test_task3).save()
}

module.exports={
    test_user1Id,
    test_user1,
    setupDatabase_before_test,
    test_task1,
    test_user2Id
}
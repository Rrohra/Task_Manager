//this file is specifacally for testing user.js.


const super_test_request = require('supertest')
const app_test = require('../src/app.test(index_duplicate_for_testing)')
const User = require('../src/models/user')  //beforeEach and afterEach
const jwt =require('jsonwebtoken')
const mongoose = require('mongoose')                 //this is for token testing 
const {test_user1, test_user1Id, setupDatabase_before_test} = require('../tests/fixtures/db_for_test_files')
/*const test_user1Id = new mongoose.Types.ObjectId()   //this is for token testing
const test_user1 = {
    _id : test_user1Id,
    name : "Test_user1",
    email: "test_user1@gmail.com",
    password : "Test@user1",
    tokens:[{
        token : jwt.sign({_id:test_user1Id.toString()}, process.env.JWT_SECRET_STRING)
    }]
}
//Teardown and setup
beforeEach(async()=>{                           //since delteMany is asynchronous   //using this so we get fresh testing db everytime
    await User.deleteMany()
    await new User(test_user1).save()

}) */

//the above code has to be also used by TASK_TEST hence we will take them into a separate file called db.js in fixtures

beforeEach(setupDatabase_before_test)





//Note: there are two more methods to test token authentication 
//1) create a token using the id of the user . get new user in 'user' variable. Save the user first. then get the id of the user from database and attach it token.
//2) why not use functions provided in the user.js and user.router.js     (because thats not how testing works, however the doutb is can we token genertion ka code atleast)
//update (yahan basically test mein postman ka codes likh rahe hai )


//1)*****************************************should signup user test***********************************
test('Should the user be able to register', async()=>{                   //test suite : 2, test case 1
    /*await super_test_request(app_test).post('/users').send({            //send provides us a method to send object
                                                                        //in post the us=rl should be same as that of user_router.js
        name : 'Rohit',
        email:'rohra@gmail.com',
        password:'Rohit@9280'

    }).expect(201) */
    //to do more assertions , lets store the response in a a variable
    console.log("case of Rohit")
    const response  =await super_test_request(app_test).post('/users').send({            //send provides us a method to send object
        
        name : 'Rohit',
        email:'rohra@gmail.com',
        password:'Rohit@9280'

        }).expect(201)

    //Assert that the db was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about the response
    expect(response.body).toMatchObject({
        user:{
            name : 'Rohit',
            email:'rohra@gmail.com'
        },
        token : user.tokens[0].token                           //user  , jo hai woh const user ka hai
    })

    expect(user.password).not.toBe('Rohit@9280')                //password shouldnt be stored in string

})


//2)************************** Should login existing user test *******************************8
test('Should login in existing user', async()=>{                            //test suite : 2, test case 2
    const response = await super_test_request(app_test).post('/users/login').send({
        email: test_user1.email,
        password : test_user1.password

    }).expect(200)

    const user1 = await User.findById(test_user1Id)
    console.log("response   " + response.body.token)
    console.log("expected   " + user1.tokens[0].token)
    console.log("expected twice   " + user1.tokens[1].token)    

    expect(response.body.token).toBe(user1.tokens[1].token) //response mein humara user_router token karke phekta hai   , 
                                                               //using one instead of two because , login creates a new token session as per the user_router code
})

// login failure
test('Should not login non- existing user', async()=>{                            //test suite : 2, test case 3
    await super_test_request(app_test).post('/users/login').send({
        email: "yolo@gmail.com",
        password : test_user1.password

    }).expect(400).send("Login failure tested")
})



//******************** 3) Get the profile of user , basicallt test the read operation */
test("Should read the profile of user (test read operation)", async()=>{                            //test suite : 2, test case 4
    await super_test_request(app_test).get('/users/me').set("Authorization",  `Bearer ${test_user1.tokens[0].token}`).send().expect(200)
})

//failure case
test("Should not read the profile of user (test read operation)", async()=>{                        //test suite : 2, test case 5
    await super_test_request(app_test).get('/users/me').send().expect(401)      //not setting the token
})



//*********************  4) Delete the logged in user , test delete functionality */
test("Should delete the logged in user", async()=>{                                                 //test suite : 2, test case 6
    await super_test_request(app_test).delete('/users/me').set("Authorization",`Bearer ${test_user1.tokens[0].token}`).send().expect(200)

    //Assert that user is deleted
    const user = await User.findById(test_user1Id)
    expect(user).toBeNull()
})

//failure case
test("Should not delete the logged in user", async()=>{                                               //test suite : 2, test case 7
    await super_test_request(app_test).delete('/users/me').send().expect(401)
})


//****************************5) avatar uploaded or not test **************/
test("is the avatar updated",async()=>{
    await super_test_request(app_test).post('/users/me/upload_profile_picture').set("Authorization",`Bearer ${test_user1.tokens[0].token}`)
        .attach('picture', 'tests/fixtures/pealy.jpg').expect(200)

        const user = await User.findById(test_user1Id)
        expect(user.avatar).toEqual(expect.any(Buffer))
    
})




//***************6) check if updated and also check if proper filed is updated****** */
//*********meaning : if name updated , check if location is NOT updated */
test('Check if proper updates are made', async()=>{
    
    const response = await super_test_request(app_test).patch('/users/me').set("Authorization",`Bearer ${test_user1.tokens[0].token}`).send({
        name: 'ROHRA'
    }).expect(200)
    const user = await User.findById(test_user1Id)
    expect(user.name).toBe('ROHRA')
})

test('Check if valid updates are made', async()=>{
    const user = User.findById(test_user1Id)
    const response = await super_test_request(app_test).patch('/users/me').set("Authorization",`Bearer ${test_user1.tokens[0].token}`).send({
        location: "ROHRA"
    }).expect(404)

    
})
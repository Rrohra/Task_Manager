//this is for testing the task_router 

//******************************************************************************************* */
//******NOTE DO: "test": "env-cmd -f ./config/test.env jest --watch --runInBand" */
//*ADD THE runInBand  OPTION TO MAKE THE TASK WORS , AS THEN THE TEST CASES WILL RUN SERIALLY */
//******************************************************************************************* */

const {test_user1, test_user1Id, setupDatabase_before_test, test_user2Id,test_task1} = require('../tests/fixtures/db_for_test_files')
const super_test_request = require('supertest')
const app_test = require('../src/app.test(index_duplicate_for_testing)')
const Task = require('../src/models/task')
beforeEach(setupDatabase_before_test)



//1)****************Create task for user test****************888

test('Should create task for user',async()=>{
    await super_test_request(app_test).post('/tasks').set("Authorization",`Bearer ${test_user1.tokens[0].token}`)
        .send({
            description: "test_task1"
        }).expect(200)

})

//********************************2) get task test and verify ****************
test("Should return tasks of logged in user", async()=>{
    const tasks = await super_test_request(app_test).get('/tasks').set("Authorization",`Bearer ${test_user1.tokens[0].token}`)
        .expect(200)

    expect(tasks.body.length).toBe(2)
})



//***************3) test to see other person can not delete logged in users tasks */
test('Should not delete other users tasks', async()=>{
    //await super_test_request(app_test).delete('/tasks/:id').set("Authorization",`Bearer ${test_user1.tokens[0].token}`)
        //.send({ owner :test_user2Id,  _id:test_task1}).expect(404)

        //or
    await super_test_request(app_test).delete('/tasks/$(test_task1._id)').set("Authorization",`Bearer ${test_user1.tokens[0].token}`)
        .send().expect(404)

    //Assert to say that task is stilll in db
    const task = await Task.findById(test_task1._id)
    expect(task).not.toBe(null)
})
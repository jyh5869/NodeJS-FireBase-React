const express = require('express')

const app = express()
const port = 5000

const schedule = require('node-schedule');//스케줄러 사용을 위한 라이브러리
const tools = require('./Router/test.js');

app.use('/', require('./Router/test.js'));

app.listen(port, (request, response) => {
    console.log(`Example app listening on port ${port}`)

    // schedule.scheduleJob('1 * * * * *', function(requestTime){
    //     console.log('The answer to life, the universe, and everything!');
    //     //console.log(tools)
    // });
})
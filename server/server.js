const express   = require('express');

const app = express()
const port = 5000

app.use('/', require('./Router/flowerAnalController.js'));
app.use('/', require('./Router/movieInfoController.js'));
app.use('/', require('./Router/commonController.js'));

app.listen(port, (request, response) => {
    console.log(`Example app listening on port ${port}`)
})
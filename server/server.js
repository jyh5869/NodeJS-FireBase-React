const express = require('express')
const app = express()
const port = 5000

app.use('/', require('./Router/test'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
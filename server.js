const dotenv = require('dotenv')
dotenv.config()


const express = require('express')
const port = process.env.PORT

const app = express()

app.use(express.json())
app.use(express.urlencoded())

app.use('/', require('./routes/routes'))

app.listen(port, () => {
    console.log(`Server listening on ${port}`)
})
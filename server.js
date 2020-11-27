const dotenv = require('dotenv')
dotenv.config()


const express = require('express')
const port = process.env.PORT

const app = express()

app.use(express.json())

app.use('/', require('./routes/routes'))

app.use(require('./middlewares/errors.middleware'))

app.listen(port, () => {
    console.log(`Server listening on ${port}`)
})
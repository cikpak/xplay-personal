require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? './.production' : './.development' })

const express = require("express");
const morgan = require("morgan");
const path = require("path");
const fs = require('fs')
const app = express();
const port = process.env.PORT || 8000;
const websocket = require('socket.io')
const socketClient = require('socket.io-client')
const { strErrors } = require('./utils/errors');
const withSocket = require('./Sockets/index');
const { getUserId } = require('./utils/userIdManager');

app.use(require('cors')())
app.use(express.json());

app.use(morgan("common", {
  stream: fs.createWriteStream(path.join(__dirname, "logs.log"), {
    flags: "a",
  }),
})
);

app.use(morgan("dev"));
app.use(require("./middlewares/logs.middleware"));

app.use("/", require("./routes/routes"));
app.use('/v2', require('./routes/routesV2'))
app.use(require("./middlewares/errors.middleware"));

//SocketIO server
const server = require('http').createServer(app)

const io = websocket(server, {
  cors: { origin: '*' }
})

io.on('connection', (client) => { console.log('connection') })

try {
  data = getUserId()

  if (data.userId) {
    withSocket(data.userId, io)
  }
} catch (err) {
  console.log('err', err)
}

//start server
server.listen(port, () => {
  console.log(`server listening on ${port}`)
})
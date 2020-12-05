const dotenv = require("dotenv");
dotenv.config();

const morgan = require("morgan");
const path = require("path");
const fs = require('fs')

const express = require("express");
const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(
  morgan("common", {
    stream: fs.createWriteStream(path.join(__dirname, "logs.log"), {
      flags: "a",
    }),
  })
);
app.use(morgan("dev"));
app.use(require("./middlewares/logs.middleware"));

app.use("/", require("./routes/routes"));
// app.use('/hamachi', require('./routes/hamach'))

app.use(require("./middlewares/errors.middleware"));

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

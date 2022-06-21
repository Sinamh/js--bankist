const express = require("express");
const os = require("os");

const PORT = 5000;
var HOST_NAME = os.hostname();

const app = express();

app.use(express.static("./public"));

app.use('')

app.listen(PORT, () => {
  console.log(`${HOST_NAME} server is running go to http://localhost:${PORT}`);
});

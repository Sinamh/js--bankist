const express = require("express");
const os = require("os");
const ip = require("ip");

const app = express();

const HOST_NAME = os.hostname();
const PROTOCOL = process.env.PROTOCOL || "http";
const IP = ip.address();
const PORT = process.env.PORT || 3000;

app.use(express.static("./public"));
// app.use('')

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(PORT, () => {
      console.log(
        `${HOST_NAME} server is running go to ${PROTOCOL}://${IP}:${PORT}`
      );
    });
  } catch (error) {
    console.log(error);
  }
};

start();

require("dotenv").config();

const express = require("express");
const os = require("os");
const ip = require("ip");
const cookieParser = require('cookie-parser');
const rateLimiter = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const helmet = require('helmet');

const authRouter = require("./routes/auth");
const connectDB = require("./db/mongo");
const notFoundMiddleware = require('./middlewares/not-found');
const errorHandlerMiddleware = require("./middlewares/error-handler");

const HOST_NAME = os.hostname();
const PROTOCOL = process.env.PROTOCOL || "http";
const IP = ip.address();
const PORT = process.env.PORT || 3000;
const DBNAME = process.env.DBNAME;

const app = express();

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(cors());
app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);

app.use("/api/v1/auth", authRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL, DBNAME);
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

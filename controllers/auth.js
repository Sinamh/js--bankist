const crypto = require("crypto");
const { nextTick } = require("process");
const { StatusCodes } = require("http-status-codes");

const CustomError = require("../errors");
const User = require("../models/Users");
const Token = require("../models/Token");
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
} = require("../utils");

const register = async (req, res, next) => {
  const { fname, lname, email, user: usr, pass, confirm } = req.body;

  if (!fname) {
    throw new CustomError.BadRequestError("First name required.");
  }

  if (!lname) {
    throw new CustomError.BadRequestError("Last name required.");
  }

  if (!Email) {
    throw new CustomError.BadRequestError("First name required.");
  }

  if (!usr) {
    throw new CustomError.BadRequestError("Username required.");
  }

  if (!pass) {
    throw new CustomError.BadRequestError("Password required.");
  }

  if (pass !== confirm || !confirm) {
    throw new CustomError.BadRequestError("Passwords don't match.");
  }

  const userAlreadyExists = await User.findOne({ username: usr });
  if (userAlreadyExists) {
    try {
      throw new CustomError.BadRequestError("User already exists");
    } catch (error) {
      return next(error);
    }
  }

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    first: fname,
    last: lname,
    username: usr,
    email,
    password: pass,
    role,
    verificationToken,
  }).catch(err => {
    next(err);
  });

  if (!user) return;

  const origin = `http://${req.get("host")}`;
  try {
    let info = await sendVerificationEmail({
      name: user.user,
      email: user.email,
      verificationToken: user.verificationToken,
      origin,
    });
  } catch (err) {
    console.log(err);
  }

  res.status(StatusCodes.CREATED).json({
    msg: "Please verify your email address!",
  });
};

const verifyEmail = async (req, res, next) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });

  if (user.isVerified) {
    try {
      throw new CustomError.UnauthenticatedError(
        "Already verified this email."
      );
    } catch (error) {
      return next(error);
    }
  }

  if (!user) {
    try {
      throw new CustomError.UnauthenticatedError("Verification Failed");
    } catch (error) {
      return next(error);
    }
  }

  if (user.verificationToken !== verificationToken) {
    try {
      throw new CustomError.UnauthenticatedError("Verification Failed");
    } catch (error) {
      return next(error);
    }
  }

  (user.isVerified = true), (user.verified = Date.now());
  user.verificationToken = "";

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Email Verified" });
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ username });

  if (!user) {
    try {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    } catch (error) {
      return next(error);
    }
  }
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    try {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    } catch (error) {
      return next(error);
    }
  }
  if (!user.isVerified) {
    try {
      throw new CustomError.UnauthenticatedError("Please verify your email");
    } catch (error) {
      return next(error);
    }
  }
  const tokenUser = createTokenUser(user);

  // create refresh token
  let refreshToken = "";
  // check for existing token
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

module.exports = {
  register,
  verifyEmail,
  login,
  // logout,
};

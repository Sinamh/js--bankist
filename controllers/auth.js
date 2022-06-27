const User = require("../models/User");

const register = async (req, res) => {
  const { fname, lname, user: usr, pass } = req.body;

  const userAlreadyExists = await User.findOne({ usr });
  if (userAlreadyExists) {
    throw new CustomError.BadRequestError("User already exists");
  }

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    fname,
    lname,
    user: usr,
    pass,
    role,
    vtoken: verificationToken,
  });
  res.status(StatusCodes.CREATED).json({
    msg: "User created successfully!",
  });
};

const login = async (req, res) => {
  const { user: usr, pass } = req.body;

  if (!usr || !pass) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ usr });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(pass);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("Please verify your email");
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

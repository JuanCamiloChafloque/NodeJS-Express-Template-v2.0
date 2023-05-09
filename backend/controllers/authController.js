const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/BadRequestError");
const UnathenticatedError = require("../errors/UnauthenticatedError");

//@desc     Register a user
//@route    POST /api/v1/auth/register
//@access   public
exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError("Please provide all values");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError("Email already in use");
  }

  const user = await User.create({ firstName, lastName, email, password });
  const token = user.createJWT();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: false,
  };

  res
    .status(StatusCodes.CREATED)
    .cookie("token", token, options)
    .json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      token: token,
    });
};

//@desc     Login a user
//@route    POST /api/v1/auth/login
//@access   public
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new UnathenticatedError("Invalid Credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnathenticatedError("Invalid Credentials");
  }

  const token = user.createJWT();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: false,
  };

  res
    .status(StatusCodes.OK)
    .cookie("token", token, options)
    .json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      token: token,
    });
};

//@desc     Update logged-in user info
//@route    POST /api/v1/auth/update
//@access   protected
exports.updateUser = async (req, res) => {
  const { email, firstName, lastName } = req.body;
  if (!email || !firstName || !lastName) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.firstName = firstName;
  user.lastName = lastName;

  await user.save();

  const token = user.createJWT();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: false,
  };

  res
    .status(StatusCodes.OK)
    .cookie("token", token, options)
    .json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      token: token,
    });
};

//@desc     Logs out current logged-in user
//@route    GET /api/v1/auth/logout
//@access   protected
exports.logout = async (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: false });
  res.status(200).json({ success: true, message: "Logged out" });
};

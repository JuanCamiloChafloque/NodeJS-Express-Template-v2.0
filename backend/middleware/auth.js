const jwt = require("jsonwebtoken");
const UnauthenticatedError = require("../errors/UnauthenticatedError");

const auth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    throw new UnauthenticatedError("Authentication Invalid");
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.id };
    next();
  } catch (err) {
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

module.exports = auth;

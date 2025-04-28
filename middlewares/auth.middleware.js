const jwt = require('jsonwebtoken');
const jwtConfig = require('../backend.configuration/jwt.config');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role
    },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.tokenExpiration,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.refreshTokenExpiration,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }
  );
};

module.exports = {
  verifyToken,
  generateToken,
  generateRefreshToken
}; 
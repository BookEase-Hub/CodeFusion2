require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || "your-secret-key-here",
  tokenExpiration: 86400, // 24 hours in seconds
  refreshTokenExpiration: 604800, // 7 days in seconds
  issuer: "codefusion-api",
  audience: "codefusion-client"
}; 
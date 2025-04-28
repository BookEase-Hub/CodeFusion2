const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user.model');
const { generateToken, generateRefreshToken } = require('./auth.middleware');
const oauthConfig = require('../backend.configuration/oauth.config');

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Google Strategy
passport.use(new GoogleStrategy(oauthConfig.google,
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({
        oauthProvider: 'google',
        oauthId: profile.id
      });

      if (!user) {
        // Check if email is already registered
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        if (existingUser) {
          return done(null, false, { message: 'Email already registered with different method' });
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value,
          oauthProvider: 'google',
          oauthId: profile.id,
          oauthProfile: profile,
          subscriptionStatus: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// GitHub Strategy
passport.use(new GitHubStrategy(oauthConfig.github,
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({
        oauthProvider: 'github',
        oauthId: profile.id
      });

      if (!user) {
        // Get primary email from GitHub profile
        const primaryEmail = profile.emails?.find(email => email.primary)?.value || profile.emails?.[0]?.value;
        
        if (!primaryEmail) {
          return done(null, false, { message: 'No email found in GitHub profile' });
        }

        // Check if email is already registered
        const existingUser = await User.findOne({ email: primaryEmail });
        if (existingUser) {
          return done(null, false, { message: 'Email already registered with different method' });
        }

        // Create new user
        user = await User.create({
          name: profile.displayName || profile.username,
          email: primaryEmail,
          avatar: profile.photos[0]?.value,
          oauthProvider: 'github',
          oauthId: profile.id,
          oauthProfile: profile,
          subscriptionStatus: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Helper function to handle OAuth callback
const handleOAuthCallback = (req, res) => {
  const token = generateToken(req.user);
  const refreshToken = generateRefreshToken(req.user);

  // Save refresh token to user
  req.user.refreshToken = refreshToken;
  req.user.save();

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Redirect to frontend with token
  res.redirect(`${process.env.FRONTEND_URL}/oauth/callback?token=${token}`);
};

module.exports = {
  passport,
  handleOAuthCallback
}; 
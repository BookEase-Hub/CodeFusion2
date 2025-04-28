const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists  
    let user = await User.findOne({ email });  
    if (user) {  
      return res.status(400).json({ error: 'User already exists' });  
    }  

    // Create new user  
    user = new User({  
      name,  
      email,  
      password,  
      subscriptionPlan: 'free',  
      subscriptionStatus: 'trial',  
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days trial  
    });  

    // Hash password  
    const salt = await bcrypt.genSalt(10);  
    user.password = await bcrypt.hash(password, salt);  

    await user.save();  

    // Create JWT  
    const payload = {  
      user: {  
        id: user.id  
      }  
    };  

    jwt.sign(  
      payload,  
      process.env.JWT_SECRET,  
      { expiresIn: '7d' },  
      (err, token) => {  
        if (err) throw err;  
        res.json({ token });  
      }  
    );  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists  
    const user = await User.findOne({ email });  
    if (!user) {  
      return res.status(400).json({ error: 'Invalid credentials' });  
    }  

    // Check password  
    const isMatch = await bcrypt.compare(password, user.password);  
    if (!isMatch) {  
      return res.status(400).json({ error: 'Invalid credentials' });  
    }  

    // Create JWT  
    const payload = {  
      user: {  
        id: user.id  
      }  
    };  

    jwt.sign(  
      payload,  
      process.env.JWT_SECRET,  
      { expiresIn: '7d' },  
      (err, token) => {  
        if (err) throw err;  
        res.json({ token, user });  
      }  
    );  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    const user = await User.findByIdAndUpdate(  
      req.user.id,  
      { name, email, bio },  
      { new: true }  
    ).select('-password');  

    res.json(user);  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update user avatar
exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    const user = await User.findByIdAndUpdate(  
      req.user.id,  
      { avatar },  
      { new: true }  
    ).select('-password');  

    res.json(user);  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update subscription
exports.updateSubscription = async (req, res) => {
  try {
    const { plan } = req.body;

    const user = await User.findByIdAndUpdate(  
      req.user.id,  
      {   
        subscriptionPlan: plan,  
        subscriptionStatus: 'active',  
        trialEndsAt: plan === 'premium' ? undefined : user.trialEndsAt  
      },  
      { new: true }  
    ).select('-password');  

    res.json(user);  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
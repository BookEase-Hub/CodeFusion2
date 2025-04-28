const Integration = require('../models/Integration');

// Get all integrations
exports.getIntegrations = async (req, res) => {
  try {
    const integrations = await Integration.find({ userId: req.user.id });
    res.json(integrations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create a new integration
exports.createIntegration = async (req, res) => {
  try {
    const { name, description, category, config } = req.body;

    const integration = new Integration({  
      name,  
      description,  
      category,  
      config,  
      userId: req.user.id  
    });  

    await integration.save();  
    res.json(integration);  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update an integration
exports.updateIntegration = async (req, res) => {
  try {
    const { status, config } = req.body;

    const integration = await Integration.findOneAndUpdate(  
      { _id: req.params.id, userId: req.user.id },  
      { status, config, lastSync: status === 'connected' ? Date.now() : null },  
      { new: true }  
    );  

    if (!integration) {  
      return res.status(404).json({ error: 'Integration not found' });  
    }  

    res.json(integration);  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete an integration
exports.deleteIntegration = async (req, res) => {
  try {
    const integration = await Integration.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!integration) {  
      return res.status(404).json({ error: 'Integration not found' });  
    }  

    res.json({ message: 'Integration removed' });  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
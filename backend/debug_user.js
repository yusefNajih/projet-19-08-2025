const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/autorent_cherkaoui')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find user
    const user = await User.findOne({ email: 'Cherkaoui@admin.com' });
    console.log('User found:', !!user);
    
    if (user) {
      console.log('User details:', {
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      });
      
      // Test password with bcrypt directly
      const directMatch = await bcrypt.compare('cherkaoui123', user.password);
      console.log('Direct bcrypt match:', directMatch);
      
      // Test with user method
      const methodMatch = await user.comparePassword('cherkaoui123');
      console.log('User method match:', methodMatch);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });


// server/scripts/fixBook18Titles.js

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const fixBook18Titles = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find all Book18 tests
    const book18Tests = await Test.find({ belongsTo: 'Book 18' });
    console.log(`📚 Found ${book18Tests.length} Book18 tests to fix`);

    // Update each test title to remove the "Book 18 - " prefix
    for (let i = 0; i < book18Tests.length; i++) {
      const test = book18Tests[i];
      const newTitle = `Test ${i + 1}`;
      
      console.log(`🔄 Updating ${test.title} → ${newTitle}`);
      
      await Test.findByIdAndUpdate(test._id, { title: newTitle });
    }

    console.log('✅ All Book18 test titles updated successfully');

    // Verify the changes
    const updatedTests = await Test.find({ belongsTo: 'Book 18' });
    console.log('\n📊 Updated Book18 tests:');
    updatedTests.forEach(t => console.log(`   - ${t.title} (belongsTo: ${t.belongsTo})`));

    // Check for any remaining title conflicts
    const allTests = await Test.find({});
    const titles = allTests.map(t => t.title);
    const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);
    
    if (duplicates.length > 0) {
      console.log('\n⚠️  WARNING: Found duplicate titles:', duplicates);
    } else {
      console.log('\n✅ No duplicate titles found');
    }

  } catch (err) {
    console.error('❌ Error fixing Book18 titles:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

fixBook18Titles(); 
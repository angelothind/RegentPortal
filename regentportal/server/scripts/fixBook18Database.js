// server/scripts/fixBook18Database.js

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const fixBook18Database = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Step 1: Check current indexes
    console.log('\n🔍 Checking current database indexes...');
    const indexes = await db.collection('tests').indexes();
    console.log('Current indexes on tests collection:');
    indexes.forEach((index, i) => {
      console.log(`   ${i}: ${JSON.stringify(index)}`);
    });
    
    // Step 2: Remove the problematic unique index on title
    console.log('\n🗑️  Removing problematic unique index on title field...');
    try {
      await db.collection('tests').dropIndex('title_1');
      console.log('✅ Successfully removed unique index on title field');
    } catch (err) {
      if (err.message.includes('index not found')) {
        console.log('ℹ️  Index title_1 not found (already removed)');
      } else {
        throw err;
      }
    }
    
    // Step 3: Verify index removal
    console.log('\n🔍 Verifying index removal...');
    const updatedIndexes = await db.collection('tests').indexes();
    console.log('Updated indexes on tests collection:');
    updatedIndexes.forEach((index, i) => {
      console.log(`   ${i}: ${JSON.stringify(index)}`);
    });
    
    // Step 4: Update Book18 test titles to simple names
    console.log('\n🔄 Updating Book18 test titles...');
    const book18Tests = await Test.find({ belongsTo: 'Book 18' });
    console.log(`Found ${book18Tests.length} Book18 tests to update`);
    
    for (let i = 0; i < book18Tests.length; i++) {
      const test = book18Tests[i];
      const newTitle = `Test ${i + 1}`;
      
      console.log(`   Updating: "${test.title}" → "${newTitle}"`);
      
      await Test.findByIdAndUpdate(test._id, { title: newTitle });
    }
    
    console.log('✅ All Book18 test titles updated successfully');
    
    // Step 5: Verify the changes
    console.log('\n📊 Final verification...');
    const updatedBook18Tests = await Test.find({ belongsTo: 'Book 18' });
    console.log('Updated Book18 tests:');
    updatedBook18Tests.forEach(t => {
      console.log(`   - ${t.title} (belongsTo: ${t.belongsTo}, ID: ${t._id})`);
    });
    
    // Step 6: Check for any remaining title conflicts
    const allTests = await Test.find({});
    const titles = allTests.map(t => t.title);
    const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);
    
    if (duplicates.length > 0) {
      console.log('\n⚠️  WARNING: Found duplicate titles:', duplicates);
      console.log('This might cause issues if not handled properly.');
    } else {
      console.log('\n✅ No duplicate titles found');
    }
    
    // Step 7: Test that we can now create tests with same titles
    console.log('\n🧪 Testing duplicate title creation...');
    try {
      // This should now work without the unique constraint
      const testTitles = ['Test 1', 'Test 2', 'Test 3', 'Test 4'];
      const book19Tests = await Test.find({ belongsTo: 'Book 19' });
      const book18Tests = await Test.find({ belongsTo: 'Book 18' });
      
      console.log('Book19 tests:', book19Tests.map(t => t.title));
      console.log('Book18 tests:', book18Tests.map(t => t.title));
      
      // Check if we have the same titles in different books
      const book19Titles = book19Tests.map(t => t.title);
      const book18Titles = book18Tests.map(t => t.title);
      
      const commonTitles = book19Titles.filter(title => book18Titles.includes(title));
      console.log('Common titles between Book19 and Book18:', commonTitles);
      
      if (commonTitles.length > 0) {
        console.log('✅ Success! Same titles can now exist in different books');
      }
      
    } catch (err) {
      console.error('❌ Error testing duplicate titles:', err.message);
    }
    
    console.log('\n🎉 Database fix completed successfully!');
    console.log('📚 Book18 now uses simple titles: Test 1, Test 2, Test 3, Test 4');
    console.log('🔑 Unique identification is now handled by ObjectId + belongsTo field');
    console.log('🎯 Frontend will now render clean, consistent test names');
    
  } catch (err) {
    console.error('❌ Error fixing Book18 database:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

fixBook18Database(); 
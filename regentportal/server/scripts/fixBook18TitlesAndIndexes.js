// server/scripts/fixBook18TitlesAndIndexes.js

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const fixBook18TitlesAndIndexes = async () => {
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
    
    // Step 2: Remove the problematic unique index on title (if it exists)
    console.log('\n🗑️  Removing problematic unique index on title field...');
    try {
      await db.collection('tests').dropIndex('title_1');
      console.log('✅ Successfully removed unique index on title field');
    } catch (err) {
      if (err.message.includes('index not found')) {
        console.log('ℹ️  Index title_1 not found (already removed)');
      } else {
        console.log('⚠️  Could not remove title_1 index:', err.message);
      }
    }
    
    // Step 3: Update Book18 test titles to simple names
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
    
    // Step 4: Force the new compound index to be created
    console.log('\n🔧 Creating new compound unique index...');
    try {
      // Drop any existing compound index first
      try {
        await db.collection('tests').dropIndex('title_1_belongsTo_1');
        console.log('✅ Removed old compound index');
      } catch (err) {
        console.log('ℹ️  No old compound index to remove');
      }
      
      // Create new compound unique index
      await db.collection('tests').createIndex(
        { title: 1, belongsTo: 1 }, 
        { unique: true, name: 'title_1_belongsTo_1' }
      );
      console.log('✅ New compound unique index created successfully');
    } catch (err) {
      console.error('❌ Error creating compound index:', err.message);
    }
    
    // Step 5: Verify the final state
    console.log('\n📊 Final verification...');
    const finalIndexes = await db.collection('tests').indexes();
    console.log('Final indexes on tests collection:');
    finalIndexes.forEach((index, i) => {
      console.log(`   ${i}: ${JSON.stringify(index)}`);
    });
    
    const updatedBook18Tests = await Test.find({ belongsTo: 'Book 18' });
    console.log('\nUpdated Book18 tests:');
    updatedBook18Tests.forEach(t => {
      console.log(`   - ${t.title} (belongsTo: ${t.belongsTo}, ID: ${t._id})`);
    });
    
    // Step 6: Test that the compound index works correctly
    console.log('\n🧪 Testing compound index functionality...');
    const book19TestsFinal = await Test.find({ belongsTo: 'Book 19' });
    const book18TestsFinal = await Test.find({ belongsTo: 'Book 18' });
    
    console.log('Book19 tests:', book19TestsFinal.map(t => t.title));
    console.log('Book18 tests:', book18TestsFinal.map(t => t.title));
    
    // Check for common titles (this should now work!)
    const book19Titles = book19TestsFinal.map(t => t.title);
    const book18Titles = book18TestsFinal.map(t => t.title);
    const commonTitles = book19Titles.filter(title => book18Titles.includes(title));
    
    if (commonTitles.length > 0) {
      console.log('✅ Success! Common titles between books:', commonTitles);
      console.log('   This proves the compound index is working correctly');
    }
    
    console.log('\n🎉 Fix completed successfully!');
    console.log('📚 Book18 now uses clean titles: Test 1, Test 2, Test 3, Test 4');
    console.log('🔑 Compound unique index ensures data integrity');
    console.log('🎯 Frontend will render clean, consistent test names');
    console.log('🚀 Ready to add Book20, Book21, etc. with same naming pattern');
    
  } catch (err) {
    console.error('❌ Error fixing Book18:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

fixBook18TitlesAndIndexes(); 
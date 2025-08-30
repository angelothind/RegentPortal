// server/scripts/fixMC2StructureProperly.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const fixMC2StructureProperly = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // First, let's restore from backup or recreate the original structure
    console.log('🔄 Restoring original test structure...');
    
    // We need to recreate the tests with proper structure
    // Let me check what the original seeding scripts look like
    console.log('📝 Checking original seeding scripts...');
    
    // For now, let's manually fix the most problematic ones
    // Let's start with Book17 Test1 Listening since that's what you're testing
    
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book 17' });
    if (test1) {
      console.log('🔄 Fixing Book17 Test1 Listening...');
      
      // Original Book17 Test1 Listening structure (40 questions)
      const originalListeningAnswers = [
        // Part 1 (Questions 1-10): 10 answers
        "litter",           // Q1
        "dogs",             // Q2
        "insects",          // Q3
        "butterflies",      // Q4
        "wall",             // Q5
        "island",           // Q6
        "boots",            // Q7
        "beginners",        // Q8
        "spoons",           // Q9
        ["35", "thirty five"], // Q10: two acceptable formats (keep as array - this is NOT MC2)

        // Part 2 (Questions 11-20): 10 answers
        "A",                // Q11
        "C",                // Q12
        "B",                // Q13
        "B",                // Q14
        ["A", "D"],         // Q15: MC2 (either order) - DUPLICATE THIS
        ["A", "D"],         // Q16: MC2 (either order) - DUPLICATE THIS
        ["B", "C"],         // Q17: MC2 (either order) - DUPLICATE THIS
        ["B", "C"],         // Q18: MC2 (either order) - DUPLICATE THIS
        ["D", "E"],         // Q19: MC2 (either order) - DUPLICATE THIS
        ["D", "E"],         // Q20: MC2 (either order) - DUPLICATE THIS

        // Part 3 (Questions 21-30): 10 answers
        "A",                // Q21
        "B",                // Q22
        "B",                // Q23
        "A",                // Q24
        "C",                // Q25
        "C",                // Q26
        "A",                // Q27
        "E",                // Q28
        "F",                // Q29
        "C",                // Q30

        // Part 4 (Questions 31-40): 10 answers
        "puzzle",           // Q31
        "logic",            // Q32
        "confusion",        // Q33
        "meditation",       // Q34
        "stone",            // Q35
        "coins",            // Q36
        "tree",             // Q37
        "breathing",        // Q38
        "paper",            // Q39
        "anxiety"           // Q40
      ];

      // Update the test
      let currentAnswers = test1.answers || new Map();
      currentAnswers.set('listening', originalListeningAnswers);
      test1.answers = currentAnswers;
      await test1.save();
      
      console.log('✅ Fixed Book17 Test1 Listening: 40 questions');
    } else {
      console.log('❌ Book17 Test1 not found!');
    }

    console.log('\n🎯 Key Point: Only MC2 questions should be duplicated!');
    console.log('❌ Arrays like ["35", "thirty five"] for Q10 should NOT be duplicated');
    console.log('✅ Arrays like ["A", "D"] for Q15-16 should be duplicated');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Test Book17 Test1 Listening to ensure it works');
    console.log('2. Then fix other tests one by one with proper logic');
    console.log('3. Only duplicate actual MC2 questions, not substitute answer arrays');

  } catch (error) {
    console.error('❌ Error fixing MC2 structure:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the fix
fixMC2StructureProperly(); 
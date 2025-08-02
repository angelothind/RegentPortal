const mongoose = require('mongoose');
const connectDB = require('../config/db');
const TestSubmission = require('../models/TestSubmission');

// Connect to database
connectDB();

const reseedTestSubmissions = async () => {
  try {
    console.log('🔄 Starting TestSubmission reseeding...');

    // Clear existing test submissions
    const deleteResult = await TestSubmission.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing test submissions`);

    // Create some sample test submissions with proper timestamps
    const sampleSubmissions = [
      {
        studentId: new mongoose.Types.ObjectId(), // You can replace with actual student IDs
        testId: new mongoose.Types.ObjectId(), // You can replace with actual test IDs
        testType: 'listening',
        answers: {
          1: "90",
          2: "stream",
          3: "facts",
          4: "map",
          5: "attractions"
        },
        correctAnswers: {
          1: "90",
          2: "stream",
          3: "facts",
          4: "map",
          5: "attractions"
        },
        results: {
          1: { userAnswer: "90", correctAnswer: "90", isCorrect: true },
          2: { userAnswer: "stream", correctAnswer: "stream", isCorrect: true },
          3: { userAnswer: "facts", correctAnswer: "facts", isCorrect: true },
          4: { userAnswer: "map", correctAnswer: "map", isCorrect: true },
          5: { userAnswer: "attractions", correctAnswer: "attractions", isCorrect: true }
        },
        score: 100,
        totalQuestions: 5,
        correctCount: 5,
        submittedAt: new Date('2024-01-15T10:30:00Z')
      },
      {
        studentId: new mongoose.Types.ObjectId(),
        testId: new mongoose.Types.ObjectId(),
        testType: 'listening',
        answers: {
          1: "90",
          2: "wrong",
          3: "facts",
          4: "",
          5: "attractions"
        },
        correctAnswers: {
          1: "90",
          2: "stream",
          3: "facts",
          4: "map",
          5: "attractions"
        },
        results: {
          1: { userAnswer: "90", correctAnswer: "90", isCorrect: true },
          2: { userAnswer: "wrong", correctAnswer: "stream", isCorrect: false },
          3: { userAnswer: "facts", correctAnswer: "facts", isCorrect: true },
          4: { userAnswer: "", correctAnswer: "map", isCorrect: false },
          5: { userAnswer: "attractions", correctAnswer: "attractions", isCorrect: true }
        },
        score: 60,
        totalQuestions: 5,
        correctCount: 3,
        submittedAt: new Date('2024-01-15T14:45:00Z')
      },
      {
        studentId: new mongoose.Types.ObjectId(),
        testId: new mongoose.Types.ObjectId(),
        testType: 'reading',
        answers: {
          1: "A",
          2: "B",
          3: "C"
        },
        correctAnswers: {
          1: "A",
          2: "B",
          3: "D"
        },
        results: {
          1: { userAnswer: "A", correctAnswer: "A", isCorrect: true },
          2: { userAnswer: "B", correctAnswer: "B", isCorrect: true },
          3: { userAnswer: "C", correctAnswer: "D", isCorrect: false }
        },
        score: 67,
        totalQuestions: 3,
        correctCount: 2,
        submittedAt: new Date('2024-01-16T09:15:00Z')
      }
    ];

    // Insert sample submissions
    const insertResult = await TestSubmission.insertMany(sampleSubmissions);
    console.log(`✅ Inserted ${insertResult.length} sample test submissions`);

    // Verify the submissions were created with timestamps
    const allSubmissions = await TestSubmission.find({}).sort({ submittedAt: -1 });
    console.log('\n📊 Sample submissions created:');
    allSubmissions.forEach((submission, index) => {
      console.log(`${index + 1}. Score: ${submission.score}% | Submitted: ${submission.submittedAt.toLocaleString()} | Type: ${submission.testType}`);
    });

    console.log('\n✅ TestSubmission reseeding completed successfully!');
    console.log('📝 Database now tracks submission timestamps properly.');

  } catch (error) {
    console.error('❌ Error during TestSubmission reseeding:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the reseeding
if (require.main === module) {
  reseedTestSubmissions();
}

module.exports = reseedTestSubmissions; 
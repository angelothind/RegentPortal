const Teacher = require('../models/Teacher');
const TestSubmission = require('../models/TestSubmission');
const Book = require('../models/Book');

const createTeacher = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existing = await Teacher.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Teacher already exists' });

    const newTeacher = new Teacher({ name, username, password });
    await newTeacher.save();

    res.status(201).json({ message: 'Teacher created', _id: newTeacher._id, username });
  } catch (err) {
    console.error('❌ Error creating teacher:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const listTeachers = async (req, res) => {
  console.log('In lookupteachers route');
  try {
    const teachers = await Teacher.find({}, 'name username');
    res.json({ teachers });
  } catch (err) {
    console.error('❌ Error fetching teachers:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!deletedTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ message: 'Teacher deleted successfully', id: deletedTeacher._id });
  } catch (err) {
    console.error('❌ Error deleting teacher:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get teacher's favorited students
const getFavorites = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ favoritedStudents: teacher.favoritedStudents || [] });
  } catch (error) {
    console.error('Error fetching favorited students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Toggle favorite student
const toggleFavorite = async (req, res) => {
  try {
    const { studentId } = req.body;
    const teacher = await Teacher.findById(req.params.teacherId);

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const studentIndex = teacher.favoritedStudents.indexOf(studentId);

    if (studentIndex === -1) {
      // Add to favorites
      teacher.favoritedStudents.push(studentId);
    } else {
      // Remove from favorites
      teacher.favoritedStudents.splice(studentIndex, 1);
    }

    await teacher.save();
    res.json({ favoritedStudents: teacher.favoritedStudents });
  } catch (error) {
    console.error('Error toggling favorite student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get student submissions for a specific student
const getStudentSubmissionsForTeacher = async (req, res) => {
  try {
    const submissions = await TestSubmission.find({
      studentId: req.params.studentId
    }).sort({ submittedAt: -1 }); // Sort by most recent first

    // Get all books to find which book each test belongs to
    const books = await Book.find();

    // Format submissions for frontend
    const formattedSubmissions = submissions.map(submission => {
      // Find which book this test belongs to
      let bookTitle = 'Unknown Book';
      let testName = 'Unknown Test';

      // Add null check for submission.testId
      if (submission.testId) {
        for (const book of books) {
          const testInBook = book.tests.find(test =>
            test.testId.toString() === submission.testId.toString()
          );
          if (testInBook) {
            bookTitle = book.name;
            testName = testInBook.testName;
            break;
          }
        }
      }

      return {
        _id: submission._id,
        testId: submission.testId,
        testTitle: 'Test', // Default title since we don't have test details
        bookTitle: bookTitle,
        testName: testName,
        testType: submission.testType,
        score: submission.score,
        correctCount: submission.correctCount,
        totalQuestions: submission.totalQuestions,
        submittedAt: submission.submittedAt,
        answers: submission.results ? Object.values(submission.results).map(result => ({
          studentAnswer: result.userAnswer || '',
          correctAnswer: result.correctAnswer || '',
          isCorrect: result.isCorrect || false
        })) : [],
        correctAnswers: submission.correctAnswers ? Object.fromEntries(submission.correctAnswers) : {}
      };
    });

    res.json({ submissions: formattedSubmissions });
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createTeacher,
  listTeachers,
  deleteTeacher,
  getFavorites,
  toggleFavorite,
  getStudentSubmissionsForTeacher
};

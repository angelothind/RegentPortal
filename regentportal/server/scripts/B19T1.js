const mongoose = require('mongoose');
const Book = require('../models/Book'); // Adjust path if needed

const MONGODB_URI = 'mongodb+srv://angelothind:Ch1angmai%21@regentportal.77lx7vr.mongodb.net/regentportal?retryWrites=true&w=majority&appName=regentportal';

const seedBook = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🟢 Connected to MongoDB');

    const bookData = {
      name: 'Book19',
      tests: [
        {
          testId: new mongoose.Types.ObjectId('6880b07b601325849efc9547'),
          testName: 'Test 1'
        },
        {
          testId: new mongoose.Types.ObjectId('6880b0cd18ac86ee3e3c3ee0'),
          testName: 'Test 2'
        }
      ]
    };

    const createdBook = await Book.create(bookData);
    console.log('✅ Book seeded:', createdBook);

    await mongoose.disconnect();
    console.log('🔴 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    await mongoose.disconnect();
  }
};

seedBook();
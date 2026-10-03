import React, { useState, useEffect } from 'react';
import '../../styles/UserLayout/SideBar.css';
import API_BASE from '../../utils/api';

const TeacherSidebar = ({
  onSelectTest,
  onShowStudents,
  onLogout,
  hasSelectedTest = false,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const [books, setBooks] = useState([]);
  const [openBook, setOpenBook] = useState(null);
  const [openTest, setOpenTest] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/books`);
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        console.error('Error fetching books:', err);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    if (!hasSelectedTest) {
      setSelectedTest(null);
      setSelectedTestType(null);
    }
  }, [hasSelectedTest]);

  const toggleBook = (bookName) => {
    setOpenBook((prev) => (prev === bookName ? null : bookName));
    setOpenTest(null);
  };

  const toggleTest = (testName) => {
    setOpenTest((prev) => (prev === testName ? null : testName));
  };

  const handleTestSelection = (testId, testName, testType) => {
    setSelectedTest({ testId, testName });
    setSelectedTestType(testType);
    onSelectTest({ type: testType, testId });
  };

  const handleShowStudents = () => {
    onShowStudents();
  };

  const toggleSidebar = () => {
    setIsShrunk(!isShrunk);
  };

  return (
    <div className={`sidebar ${isShrunk ? 'shrunk' : ''}`}>
      <div className="sidebar-controls">
        <button type="button" className="sidebar-toggle" onClick={toggleSidebar}>
          {isShrunk ? '→' : '←'}
        </button>
      </div>
      {hasSelectedTest && !isFullscreen && (
        <button
          type="button"
          className="sidebar-toggle sidebar-fullscreen-toggle"
          onClick={onToggleFullscreen}
          aria-label="Enter fullscreen"
          title="Enter fullscreen"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"
            />
          </svg>
        </button>
      )}

      {!isShrunk && (
        <>
          <h2 className="sidebar-title">Teacher Portal</h2>

          <ul className="sidebar-nav">
            <li>
              <button
                type="button"
                className={!hasSelectedTest ? 'selected' : ''}
                onClick={handleShowStudents}
              >
                Students
              </button>
            </li>

            {books.map((book) => (
              <li key={book._id}>
                <button type="button" onClick={() => toggleBook(book.name)}>{book.name}</button>

                {openBook === book.name && (
                  <ul className="dropdown">
                    {book.tests.map(({ testId, testName }) => (
                      <li key={testId?._id || testName}>
                        <button
                          type="button"
                          onClick={() => toggleTest(testName)}
                          className={selectedTest && selectedTest.testId._id === testId?._id ? 'selected' : ''}
                        >
                          {testName}
                        </button>

                        {openTest === testName && (
                          <ul className="dropdown nested">
                            <li>
                              <button
                                type="button"
                                onClick={() => handleTestSelection(testId, testName, 'Reading')}
                                className={selectedTest && selectedTest.testId._id === testId?._id && selectedTestType === 'Reading' ? 'selected' : ''}
                              >
                                Reading
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => handleTestSelection(testId, testName, 'Listening')}
                                className={selectedTest && selectedTest.testId._id === testId?._id && selectedTestType === 'Listening' ? 'selected' : ''}
                              >
                                Listening
                              </button>
                            </li>
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}

            <li>
              <button type="button" className="logout" onClick={onLogout}>
                Logout
              </button>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default TeacherSidebar;

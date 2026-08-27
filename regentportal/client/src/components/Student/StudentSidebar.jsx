import React, { useState, useEffect } from 'react';
import '../../styles/UserLayout/SideBar.css';
import API_BASE from '../../utils/api';

const StudentSidebar = ({
  onSelectTest,
  onLogout,
  isLoggingOut = false,
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
    console.log('📦 StudentSidebar mounted');
    
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

  const toggleBook = (bookName) => {
    setOpenBook((prev) => (prev === bookName ? null : bookName));
    setOpenTest(null); // reset open test section
  };

  const toggleTest = (testName) => {
    setOpenTest((prev) => (prev === testName ? null : testName));
  };

  const handleTestSelection = (testId, testName, testType) => {
    // testId is an object with _id property, we need to pass the object structure
    console.log('🔍 handleTestSelection called with:', { testId, testName, testType });
    setSelectedTest({ testId, testName });
    setSelectedTestType(testType);
    onSelectTest({ type: testType, testId });
    console.log('🔍 Test selection completed');
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
        {hasSelectedTest && !isFullscreen && (
          <button
            type="button"
            className="sidebar-toggle sidebar-fullscreen-toggle"
            onClick={onToggleFullscreen}
            aria-label="Enter fullscreen"
            title="Enter fullscreen"
          >
            ⛶
          </button>
        )}
      </div>

      {!isShrunk && (
        <>
          <h2 className="sidebar-title">Student Portal</h2>
          
          <ul className="sidebar-nav">
            {books.map((book) => (
              <li key={book._id}>
                <button onClick={() => toggleBook(book.name)}>{book.name}</button>

                {openBook === book.name && (
                  <ul className="dropdown">
                    {book.tests.map(({ testId, testName }) => (
                      <li key={testId?._id || testName}>
                        <button 
                          onClick={() => toggleTest(testName)}
                          className={selectedTest && selectedTest.testId._id === testId?._id ? 'selected' : ''}
                        >
                          {testName}
                        </button>

                        {openTest === testName && (
                          <ul className="dropdown nested">
                            <li>
                              <button 
                                onClick={() => handleTestSelection(testId, testName, 'Reading')}
                                className={selectedTest && selectedTest.testId._id === testId?._id && selectedTestType === 'Reading' ? 'selected' : ''}
                              >
                                Reading
                              </button>
                            </li>
                            <li>
                              <button 
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
              <button 
          className={`logout ${isLoggingOut ? 'logging-out' : ''}`} 
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default StudentSidebar;
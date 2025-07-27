import React from 'react';

const ListeningTest = ({ audioSrc, questions }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Listening Test</h2>
      <audio controls style={{ width: '100%' }}>
        <source src={audioSrc} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      <div style={{ marginTop: '20px' }}>
        {questions && questions.length > 0 ? (
          questions.map((q, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <strong>Question {q.questionNumber}:</strong> {q.question || 'Placeholder question'}
            </div>
          ))
        ) : (
          <p>No questions available.</p>
        )}
      </div>
    </div>
  );
};

export default ListeningTest;

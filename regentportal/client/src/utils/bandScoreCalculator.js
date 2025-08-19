/**
 * Utility functions for calculating IELTS band scores
 * Based on the official IELTS scoring system
 */

/**
 * Converts correct answer count to IELTS band score
 * @param {number} correctAnswers - Number of correct answers (out of 40)
 * @param {string} testType - Type of test ('reading' or 'listening')
 * @returns {number|string} - IELTS band score or error message
 */
export const calculateIELTSBand = (correctAnswers, testType) => {
  const score = parseInt(correctAnswers);
  
  if (isNaN(score) || score < 0 || score > 40) {
    return 'Invalid score';
  }
  
  if (testType.toLowerCase() === 'reading') {
    // Academic Reading conversion
    if (score >= 39) return 9;
    if (score >= 37) return 8.5;
    if (score >= 35) return 8;
    if (score >= 33) return 7.5;
    if (score >= 30) return 7;
    if (score >= 27) return 6.5;
    if (score >= 23) return 6;
    if (score >= 19) return 5.5;
    if (score >= 15) return 5;
    if (score >= 13) return 4.5;
    if (score >= 10) return 4;
    return 'Below Band 4';
  } else if (testType.toLowerCase() === 'listening') {
    // Listening conversion
    if (score >= 39) return 9;
    if (score >= 37) return 8.5;
    if (score >= 35) return 8;
    if (score >= 32) return 7.5;
    if (score >= 30) return 7;
    if (score >= 26) return 6.5;
    if (score >= 23) return 6;
    if (score >= 18) return 5.5;
    if (score >= 16) return 5;
    if (score >= 13) return 4.5;
    if (score >= 10) return 4;
    return 'Below Band 4';
  }
  
  return 'Invalid test type';
};

/**
 * Gets the band score description for display
 * @param {number|string} bandScore - The calculated band score
 * @returns {string} - Human-readable description
 */
export const getBandScoreDescription = (bandScore) => {
  if (typeof bandScore === 'number') {
    if (bandScore === 9) return 'Expert User';
    if (bandScore === 8.5) return 'Very Good User';
    if (bandScore === 8) return 'Very Good User';
    if (bandScore === 7.5) return 'Good User';
    if (bandScore === 7) return 'Good User';
    if (bandScore === 6.5) return 'Competent User';
    if (bandScore === 6) return 'Competent User';
    if (bandScore === 5.5) return 'Modest User';
    if (bandScore === 5) return 'Modest User';
    if (bandScore === 4.5) return 'Limited User';
    if (bandScore === 4) return 'Limited User';
  }
  return 'Below Band 4';
};

/**
 * Formats the band score for display
 * @param {number|string} bandScore - The calculated band score
 * @returns {string} - Formatted band score string
 */
export const formatBandScore = (bandScore) => {
  if (typeof bandScore === 'number') {
    return `Band ${bandScore}`;
  }
  return bandScore;
}; 
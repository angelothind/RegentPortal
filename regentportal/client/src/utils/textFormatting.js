/**
 * Utility functions for text formatting in question components
 */

/**
 * Converts ALL CAPS text to bold formatting
 * @param {string} text - The text to process
 * @returns {string} - Text with ALL CAPS converted to bold
 */
export const convertAllCapsToBold = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Pattern to match ALL CAPS words (2 or more consecutive uppercase letters)
  // This will match words like "NB", "TRUE", "FALSE", "NOT GIVEN", "YES", "NO", etc.
  // But won't match single letters like "A", "B", "C" which are just option labels
  return text.replace(/\b([A-Z]{2,})\b/g, '<strong>$1</strong>');
};

/**
 * Processes text with multiple formatting options
 * @param {string} text - The text to process
 * @param {Object} options - Processing options
 * @returns {string} - Processed text
 */
export const processTextFormatting = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  // Convert ALL CAPS words to bold first
  processedText = convertAllCapsToBold(processedText);
  
  // Convert **text** to <strong>text</strong>
  processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *text* to <em>text</em>
  processedText = processedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert `text` to <code>text</code>
  processedText = processedText.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Convert line breaks to <br> tags
  processedText = processedText.replace(/\n/g, '<br>');
  
  return processedText;
}; 
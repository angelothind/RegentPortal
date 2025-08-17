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
  
  // Pattern to match ALL CAPS words (1 or more consecutive uppercase letters)
  // This will match words like "A", "OR", "ONE", "TWO", "NB", "TRUE", "FALSE", etc.
  return text.replace(/\b([A-Z]+)\b/g, '<strong>$1</strong>');
};

/**
 * Processes text with multiple formatting options
 * @param {string} text - The text to process
 * @param {Object} options - Processing options
 * @returns {string} - Processed text
 */
export const processTextFormatting = (text, options = {}) => {
  if (!text || typeof text !== 'string') return text;
  
  let processedText = text;
  
  // Convert ALL CAPS to bold
  if (options.convertAllCaps !== false) {
    processedText = convertAllCapsToBold(processedText);
  }
  
  // Convert markdown bold markers to HTML
  if (options.convertMarkdown !== false) {
    processedText = processedText.replace(/\*\*(\d+)\*\*/g, '<strong>($1)</strong>');
  }
  
  // Convert bullet tags
  if (options.convertBullets !== false) {
    processedText = processedText.replace(/\[bullet\]/g, '<span class="bullet-point">•</span>');
  }
  
  // Convert newlines to HTML line breaks
  if (options.convertNewlines !== false) {
    processedText = processedText.replace(/\n/g, '<br>');
  }
  
  return processedText;
}; 
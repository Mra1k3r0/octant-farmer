const Logger = require('./logger');

/**
 * Handle API errors
 * @param {Error} error - Error object
 * @param {string} accountId - Account identifier for logging
 */
function handleApiError(error, accountId = '') {
  const prefix = accountId ? `[${accountId}]` : '';

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    Logger.error(`${prefix} Status: ${error.response.status}`);
    Logger.debug(`${prefix} Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
    Logger.debug(`${prefix} Data: ${JSON.stringify(error.response.data, null, 2)}`);
  } else if (error.request) {
    // The request was made but no response was received
    Logger.error(`${prefix} No response received from server`);
    Logger.debug(`${prefix} Request: ${JSON.stringify(error.request, null, 2)}`);
  } else {
    // Something happened in setting up the request that triggered an Error
    Logger.error(`${prefix} Error: ${error.message}`);
  }
}

/**
 * Custom file reader function
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} File contents
 */
function readFile(filePath) {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Parse accounts from file content
 * @param {string} fileContent - Content of accounts file
 * @returns {Array<{email: string, password: string}>} Array of account objects
 */
function parseAccounts(fileContent) {
  const accounts = [];
  const lines = fileContent.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const parts = trimmedLine.split(':');
    if (parts.length >= 2) {
      accounts.push({
        email: parts[0].trim(),
        password: parts[1].trim(),
      });
    }
  }

  return accounts;
}

module.exports = {
  handleApiError,
  readFile,
  parseAccounts,
};

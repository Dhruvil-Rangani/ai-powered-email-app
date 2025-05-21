/**
 * Email-related types and interfaces
 */

/**
 * @typedef {Object} SearchFilters
 * @property {string} [from] - Search in sender email/name
 * @property {string} [subject] - Search in email subject
 * @property {string} [body] - Search in email body
 * @property {string} [after] - Search emails after this date (ISO format)
 * @property {string} [before] - Search emails before this date (ISO format)
 * @property {string} [tag] - Filter by tag
 */

module.exports = {
    SearchFilters: {}
}; 
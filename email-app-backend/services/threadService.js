// services/threadService.js
const groupByThread = (emails) => {
    const threads = new Map();
  
    emails.forEach(email => {
      const threadKey = email.inReplyTo || email.references?.[0] || email.messageId;
  
      if (!threads.has(threadKey)) {
        threads.set(threadKey, []);
      }
  
      threads.get(threadKey).push(email);
    });
  
    return Array.from(threads.values()).map(thread =>
      thread.sort((a, b) => new Date(b.date) - new Date(a.date))
    );
  };
  
  module.exports = { groupByThread };
  
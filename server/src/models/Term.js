const promisify = require('util').promisify;
const db = require('../../../dbconnection');
db.query = promisify(db.query);

module.exports = {
  async getTerm(term, sessionId) {
    const termResults = await db.query("SELECT id FROM term WHERE num = ? AND sid = ?", [term, sessionId]);
    return termResults;
  },

  async getTermById(id) {
    const termResults = await db.query("SELECT * FROM term WHERE id = ?", [id]);
    return termResults[0];
  },

  async createTerm(term, sessionId) {
    const newTerm = await db.query("INSERT INTO term (num, sid) VALUES (?, ?)", [term, sessionId]);
    return newTerm;
  }
};
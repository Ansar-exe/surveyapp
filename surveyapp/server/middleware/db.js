// db.js — JSON file-based database using lowdb v1
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, '../data/db.json'));
const db = low(adapter);

// Set default structure
db.defaults({
  users: [],
  surveys: [],
  responses: [],
}).write();

module.exports = db;

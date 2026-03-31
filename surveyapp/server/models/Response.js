const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  answers:  { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Response', responseSchema);

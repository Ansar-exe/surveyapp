const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  answers:  { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

responseSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Response', responseSchema);

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type:    { type: String, enum: ['single', 'multiple', 'rating', 'text'], required: true },
  text:    { type: String, required: true },
  options: [String],
}, { _id: false });

const surveySchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  desc:       { type: String, default: '' },
  category:   { type: String, required: true },
  status:     { type: String, enum: ['active', 'closed'], default: 'active' },
  authorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  questions:  [questionSchema],
  results:    { type: mongoose.Schema.Types.Mixed, default: {} },
  responses:  { type: Number, default: 0 },
}, { timestamps: true });

surveySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Survey', surveySchema);

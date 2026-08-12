import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], 
  correctAnswer: { type: String, required: true }
});

const quizSchema = new mongoose.Schema({
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  lessonId: { // <-- New field linking to the specific video
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  title: { type: String, required: true },
  questions: [questionSchema]
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
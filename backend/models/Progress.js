import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  // Array of lesson IDs the student has marked as 'watched' or 'done'
  completedLessons: [{ 
    type: mongoose.Schema.Types.ObjectId 
  }],
  // Array to track their quiz results
  quizScores: [{
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    score: { type: Number },
    total: { type: Number }
  }]
}, { timestamps: true });

export default mongoose.model('Progress', progressSchema);
import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String }, // Can be a YouTube/Vimeo link
  content: { type: String }, // Text content or instructions
  duration: { type: Number }, // In minutes
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  category: { type: String, required: true },
  instructorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  lessons: [lessonSchema], // Embeds the lessons directly into the course
  studentsEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
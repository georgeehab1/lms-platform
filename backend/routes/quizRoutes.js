import express from 'express';
import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Instructor access required' });
    }
    
    // Now accepting lessonId
    const { courseId, lessonId, title, questions } = req.body;
    
    const course = await Course.findById(courseId);
    if (!course || course.instructorId.toString() !== req.user._id.toString()) {
       return res.status(401).json({ message: 'Not authorized for this course' });
    }

    const quiz = await Quiz.create({ courseId, lessonId, title, questions });
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating quiz' });
  }
});

router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching quizzes' });
  }
});

export default router;
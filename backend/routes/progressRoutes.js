import express from 'express';
import Progress from '../models/Progress.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// ==========================================
// Get progress for a specific course
// GET /api/progress/:courseId
// ==========================================
router.get('/:courseId', protect, async (req, res) => {
  try {
    let progress = await Progress.findOne({ 
      studentId: req.user._id, 
      courseId: req.params.courseId 
    });

    // If no progress exists yet, return an empty template
    if (!progress) {
      return res.json({ completedLessons: [], quizScores: [] });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching progress' });
  }
});

// ==========================================
// Mark a lesson as completed
// POST /api/progress/:courseId/lesson
// ==========================================
router.post('/:courseId/lesson', protect, async (req, res) => {
  try {
    const { lessonId } = req.body;
    
    // Find or create progress document
    let progress = await Progress.findOne({ 
      studentId: req.user._id, 
      courseId: req.params.courseId 
    });

    if (!progress) {
      progress = await Progress.create({
        studentId: req.user._id,
        courseId: req.params.courseId,
        completedLessons: [lessonId]
      });
    } else if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      await progress.save();
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating lesson progress' });
  }
});

// ==========================================
// Submit a quiz score
// POST /api/progress/:courseId/quiz
// ==========================================
router.post('/:courseId/quiz', protect, async (req, res) => {
  try {
    const { quizId, score, total } = req.body;
    
    let progress = await Progress.findOne({ 
      studentId: req.user._id, 
      courseId: req.params.courseId 
    });

    if (!progress) {
      progress = await Progress.create({
        studentId: req.user._id,
        courseId: req.params.courseId,
        quizScores: [{ quizId, score, total }]
      });
    } else {
      // Check if quiz was already taken to update the score, otherwise add it
      const existingScoreIndex = progress.quizScores.findIndex(q => q.quizId.toString() === quizId);
      if (existingScoreIndex > -1) {
         progress.quizScores[existingScoreIndex] = { quizId, score, total };
      } else {
         progress.quizScores.push({ quizId, score, total });
      }
      await progress.save();
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error saving quiz score' });
  }
});

export default router;
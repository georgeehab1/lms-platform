import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// ==========================================
// Get all published courses (For Students)
// GET /api/courses
// ==========================================
router.get('/', async (req, res) => {
  try {
    // Only fetch courses where isPublished is true
    const courses = await Course.find({ isPublished: true })
      .populate('instructorId', 'name email') // Bring in the instructor's details
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching courses' });
  }
});

// ==========================================
// Get instructor's own courses
// GET /api/courses/instructor
// ==========================================
router.get('/instructor', protect, async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Instructor access required' });
    }

    const courses = await Course.find({ instructorId: req.user._id }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching your courses' });
  }
});

// ==========================================
// Create a new course (Instructor only)
// POST /api/courses
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Instructor access required' });
    }

    const { title, description, category, isPublished } = req.body;

    const newCourse = await Course.create({
      title,
      description,
      category,
      instructorId: req.user._id,
      isPublished: isPublished || false
    });

    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating course' });
  }
});

// ==========================================
// Add a lesson to a course (Instructor only)
// POST /api/courses/:id/lessons
// ==========================================
router.post('/:id/lessons', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Ensure the user adding the lesson is the one who created the course
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to modify this course' });
    }

    const { title, videoUrl, content, duration } = req.body;

    const newLesson = {
      title,
      videoUrl,
      content,
      duration
    };

    course.lessons.push(newLesson);
    await course.save();

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding lesson' });
  }
});

// ==========================================
// Enroll in a course (Students)
// POST /api/courses/:id/enroll
// ==========================================
router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the student is already enrolled
    if (course.studentsEnrolled.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Add student to course's enrolled list
    course.studentsEnrolled.push(req.user._id);
    await course.save();

    // Add course to student's enrolled list
    user.enrolledCourses.push(course._id);
    await user.save();

    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during enrollment' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructorId', 'name email');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching course details' });
  }
});

// ==========================================
// Update a course (Instructor only)
// PUT /api/courses/:id
// ==========================================
router.put('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating course' });
  }
});

// ==========================================
// Delete a course (Instructor only)
// DELETE /api/courses/:id
// ==========================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await course.deleteOne();
    res.json({ message: 'Course removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting course' });
  }
});

router.put('/:courseId/lessons/:lessonId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    lesson.title = req.body.title || lesson.title;
    lesson.videoUrl = req.body.videoUrl || lesson.videoUrl;
    lesson.content = req.body.content || lesson.content;
    lesson.duration = req.body.duration || lesson.duration;

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating lesson' });
  }
});

router.delete('/:courseId/lessons/:lessonId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    course.lessons.pull(req.params.lessonId);
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting lesson' });
  }
});

export default router;
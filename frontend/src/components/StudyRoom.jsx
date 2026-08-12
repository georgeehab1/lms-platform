import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, CheckCircle, Loader2, Check, HelpCircle } from 'lucide-react';

export default function StudyRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  
  const [quizzes, setQuizzes] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourseAndProgress();
    fetchQuizzes();
  }, [id]);

  const fetchCourseAndProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const courseRes = await fetch(`https://lmsplatform-qla91z3r.b4a.run/api/courses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const progRes = await fetch(`https://lmsplatform-qla91z3r.b4a.run/api/progress/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const courseData = await courseRes.json();
      const progData = await progRes.json();

      if (courseRes.ok) {
        setCourse(courseData);
        if (courseData.lessons && courseData.lessons.length > 0) setActiveLesson(courseData.lessons[0]);
      }
      if (progRes.ok && progData.completedLessons) setCompletedLessons(progData.completedLessons);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://lmsplatform-qla91z3r.b4a.run/api/quizzes/course/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setQuizzes(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const markLessonComplete = async (lessonId) => {
    if (completedLessons.includes(lessonId)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://lmsplatform-qla91z3r.b4a.run/api/progress/${id}/lesson`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId })
      });
      if (res.ok) setCompletedLessons([...completedLessons, lessonId]);
    } catch (error) {
      console.error(error);
    }
  };

  const submitQuiz = async (quiz) => {
    let score = 0;
    quiz.questions.forEach((q, index) => {
      if (quizAnswers[index] === q.correctAnswer) score++;
    });
    
    setQuizResult({ score, total: quiz.questions.length });

    try {
      const token = localStorage.getItem('token');
      await fetch(`https://lmsplatform-qla91z3r.b4a.run/api/progress/${id}/quiz`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quiz._id, score, total: quiz.questions.length })
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLessonChange = (lesson) => {
    setActiveLesson(lesson);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  if (isLoading || !course) {
    return <div className="min-h-screen bg-[#FFF6E5] flex justify-center items-center"><Loader2 className="h-10 w-10 text-[#FCD34D] animate-spin" /></div>;
  }

  const progressPercentage = course.lessons.length > 0 ? Math.round((completedLessons.length / course.lessons.length) * 100) : 0;
  const activeQuiz = quizzes.find(q => q.lessonId === activeLesson?._id);

  return (
    <div className="min-h-screen bg-[#FFF6E5] font-sans text-slate-900 flex flex-col">
      <nav className="bg-transparent pt-4 px-4 sm:px-8">
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/student-dashboard')} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-900" />
            </button>
            <h1 className="text-xl font-extrabold tracking-tight">{course.title}</h1>
          </div>
          <div className="flex items-center gap-4 hidden sm:flex">
            <div className="text-sm font-bold text-slate-500">{progressPercentage}% Complete</div>
            <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#FCD34D] transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden mt-2">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-md">
                <iframe src={getEmbedUrl(activeLesson.videoUrl)} className="w-full h-full" allowFullScreen title={activeLesson.title}></iframe>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-8 rounded-[2rem] shadow-sm gap-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900">{activeLesson.title}</h2>
                  <p className="text-slate-500 mt-3 font-medium leading-relaxed">{activeLesson.content}</p>
                </div>
                <button onClick={() => markLessonComplete(activeLesson._id)} disabled={completedLessons.includes(activeLesson._id)} className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-extrabold transition-colors whitespace-nowrap ${completedLessons.includes(activeLesson._id) ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 hover:bg-black text-white'}`}>
                  {completedLessons.includes(activeLesson._id) ? <><Check className="h-5 w-5" /> Completed</> : <><CheckCircle className="h-5 w-5 text-[#FCD34D]" /> Mark as Complete</>}
                </button>
              </div>

              {activeQuiz && (
                <div className="bg-white rounded-[2rem] p-8 shadow-sm">
                  <h3 className="text-2xl font-extrabold mb-8 flex items-center gap-3 text-slate-900">
                    <div className="bg-[#FCD34D] p-2 rounded-full"><HelpCircle className="h-6 w-6 text-slate-900" /></div> Lesson Quiz: {activeQuiz.title}
                  </h3>
                  
                  {quizResult && (
                    <div className="p-8 rounded-[1.5rem] text-center bg-[#FFF6E5] mb-8">
                      <h4 className="text-3xl font-extrabold text-slate-900 mb-3">You scored {quizResult.score} out of {quizResult.total}!</h4>
                      
                    </div>
                  )}

                  <div className="space-y-10">
                    {activeQuiz.questions.map((q, qIndex) => (
                      <div key={qIndex} className="space-y-4">
                        <p className="font-extrabold text-xl text-slate-900">{qIndex + 1}. {q.questionText}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {q.options.map((opt, oIndex) => {
                            const isSubmitted = quizResult !== null;
                            const isSelected = quizAnswers[qIndex] === opt;
                            const isCorrect = q.correctAnswer === opt;
                            const isWrongSelection = isSelected && !isCorrect;

                            let optionStyle = 'bg-white border-slate-100 hover:border-slate-300 text-slate-600';
                            
                            if (isSubmitted) {
                              if (isCorrect) {
                                optionStyle = 'bg-green-50 border-green-500 text-green-900';
                              } else if (isWrongSelection) {
                                optionStyle = 'bg-red-50 border-red-500 text-red-900';
                              } else {
                                optionStyle = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
                              }
                            } else if (isSelected) {
                              optionStyle = 'bg-[#FFF6E5] border-[#FCD34D] text-slate-900';
                            }

                            return (
                              <button 
                                key={oIndex} 
                                disabled={isSubmitted}
                                onClick={() => setQuizAnswers({...quizAnswers, [qIndex]: opt})} 
                                className={`p-5 rounded-[1.5rem] text-left transition-all font-bold border-2 ${optionStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    
                    {!quizResult && (
                      <button onClick={() => submitQuiz(activeQuiz)} disabled={Object.keys(quizAnswers).length !== activeQuiz.questions.length} className="w-full py-5 bg-slate-900 text-white font-extrabold rounded-full hover:bg-black disabled:opacity-50 transition-colors text-lg">
                        Submit Quiz Answers
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 font-bold">No lessons available.</div>
          )}
        </div>

        <div className="w-full lg:w-96 bg-white rounded-[2rem] m-4 lg:ml-0 lg:my-8 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-white z-10 shrink-0">
            <h3 className="text-xl font-extrabold text-slate-900">Course Content</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {course.lessons.map((lesson, index) => {
              const isCompleted = completedLessons.includes(lesson._id);
              const isActive = activeLesson?._id === lesson._id;
              const hasQuiz = quizzes.some(q => q.lessonId === lesson._id);
              return (
                <button key={lesson._id} onClick={() => handleLessonChange(lesson)} className={`w-full text-left p-5 rounded-[1.5rem] flex items-start gap-4 transition-all border-2 ${isActive ? 'bg-[#FFF6E5] border-[#FCD34D]' : 'bg-white border-transparent hover:bg-slate-50'}`}>
                  <span className="flex-shrink-0 mt-0.5">{isCompleted ? <CheckCircle className="h-6 w-6 text-[#FCD34D]" /> : isActive ? <PlayCircle className="h-6 w-6 text-slate-900" /> : <div className="h-6 w-6 rounded-full border-2 border-slate-300" />}</span>
                  <div className="flex-1">
                    <div className={`font-extrabold text-lg leading-tight ${isCompleted && !isActive ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900'}`}>{index + 1}. {lesson.title}</div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-500 mt-2">
                      <span>{lesson.duration} mins</span>
                      {hasQuiz && <span className="flex items-center gap-1.5 text-slate-900"><div className="h-1.5 w-1.5 bg-[#FCD34D] rounded-full"></div> Quiz</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
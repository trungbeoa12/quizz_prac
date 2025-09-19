import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { quizApi } from '../services/api';
import type { Question, GradeResponse } from '../types';

const Quiz: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Per-question state
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [graded, setGraded] = useState(false);
  const [result, setResult] = useState<{isCorrect: boolean, correct: number[]} | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);

  const module = searchParams.get('module') || 'all';
  const seed = parseInt(searchParams.get('seed') || '0');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await quizApi.getQuestions(module, seed);
        setQuestions(response.questions);
      } catch (err) {
        setError('Không thể tải câu hỏi. Vui lòng thử lại.');
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [module, seed]);

  // Reset question state when changing questions
  useEffect(() => {
    resetQuestionState();
  }, [currentQuestionIndex]);

  // Helper functions
  const isEqualSet = (a: Set<number>, b: Set<number>) => {
    if (a.size !== b.size) return false;
    for (const x of a) if (!b.has(x)) return false;
    return true;
  };

  const gradeQuestion = (correct: number[], selected: Set<number>) => {
    const ok = isEqualSet(new Set(correct), selected);
    return { isCorrect: ok, correct };
  };

  const toggleOption = (idx: number) => {
    if (graded) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isMulti = currentQuestion.correctIndexes.length > 1;
    
    if (isMulti) {
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(idx)) next.delete(idx); else next.add(idx);
        return next;
      });
    } else {
      setSelected(new Set([idx]));
    }
  };

  const resetQuestionState = () => {
    setSelected(new Set());
    setGraded(false);
    setResult(null);
  };

  const handleNext = () => {
    if (!graded) {
      // Grade current question
      const currentQuestion = questions[currentQuestionIndex];
      const r = gradeQuestion(currentQuestion.correctIndexes, selected);
      setResult(r);
      setGraded(true);
      
      // Increment answered count if this is first time grading
      if (answeredCount === currentQuestionIndex) {
        setAnsweredCount(prev => prev + 1);
      }
      return;
    }
    
    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetQuestionState();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      resetQuestionState();
    }
  };

  const handleFinish = () => {
    // Calculate final score
    const totalQuestions = questions.length;
    const percentage = Math.round((answeredCount / totalQuestions) * 100);
    
    alert(`Bài thi hoàn thành!\nKết quả: ${answeredCount}/${totalQuestions} (${percentage}%)\n${percentage >= 70 ? 'Chúc mừng! Bạn đã vượt qua!' : 'Cần cố gắng thêm nhé!'}`);
    
    // Navigate back to home
    navigate('/');
  };

  const handleRetry = () => {
    // Generate new random seed for different question order
    const newSeed = Math.floor(Math.random() * 1000000);
    navigate(`/quiz?module=${module}&seed=${newSeed}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lỗi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBackToHome}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
          <div className="text-gray-500 text-6xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Không có câu hỏi</h2>
          <p className="text-gray-600 mb-4">Module này chưa có câu hỏi nào.</p>
          <button
            onClick={handleBackToHome}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }


  // Show quiz interface
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Bài thi: {module === 'all' ? 'Tất cả module' : module}
              </h1>
              <button
                onClick={handleBackToHome}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                🏠 Trang chủ
              </button>
            </div>
            
            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Câu {currentQuestionIndex + 1} / {questions.length}</span>
                <span>Đã trả lời: {answeredCount}/{questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isUserSelected = selected.has(index);
                const isCorrectAnswer = result?.correct.includes(index);
                const isWrongAnswer = graded && isUserSelected && !isCorrectAnswer;
                
                let optionClasses = "flex items-center p-4 border rounded-lg transition-colors";
                
                if (!graded) {
                  optionClasses += isUserSelected 
                    ? " border-blue-500 bg-blue-50 cursor-pointer hover:bg-blue-100"
                    : " border-gray-200 hover:bg-gray-50 cursor-pointer";
                } else {
                  if (isCorrectAnswer) {
                    optionClasses += " bg-green-100 text-green-800 border-green-400";
                  } else if (isWrongAnswer) {
                    optionClasses += " bg-red-100 text-red-800 border-red-400";
                  } else {
                    optionClasses += " bg-white text-gray-700 border-gray-200";
                  }
                }

                const isMulti = currentQuestion.correctIndexes.length > 1;
                const inputType = isMulti ? "checkbox" : "radio";

                return (
                  <label
                    key={index}
                    className={optionClasses}
                    onClick={() => toggleOption(index)}
                  >
                    <input
                      type={inputType}
                      name={`question-${currentQuestion.id}`}
                      value={index}
                      checked={isUserSelected}
                      onChange={() => toggleOption(index)}
                      disabled={graded}
                      className="mr-4 h-5 w-5 text-blue-600"
                    />
                    <span className="font-medium text-gray-800 mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-700">{option}</span>
                  </label>
                );
              })}
            </div>

            {/* Show result after grading */}
            {graded && result && (
              <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center mb-2">
                  <span className={`text-lg font-medium ${
                    result.isCorrect 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {result.isCorrect ? '✅ Đúng!' : '❌ Sai!'}
                  </span>
                </div>
                {currentQuestion.explanation && (
                  <div className="text-sm text-gray-700">
                    <strong>Giải thích:</strong> {currentQuestion.explanation}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              ← Câu trước
            </button>

            <div className="flex flex-wrap gap-2 justify-center">
              {questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentQuestionIndex(i);
                    resetQuestionState();
                  }}
                  className={`w-10 h-10 rounded-full text-sm flex items-center justify-center transition-colors ${
                    i === currentQuestionIndex
                      ? 'bg-purple-600 text-white'
                      : i < answeredCount
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleFinish}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                🏁 Hoàn thành
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {!graded ? 'Chấm câu này' : 'Câu tiếp →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;

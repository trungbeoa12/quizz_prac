import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { quizApi } from '../services/api';
import type { Question, GradeResponse } from '../types';

const Quiz: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizResults, setQuizResults] = useState<GradeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleToggleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => {
      const existing = prev[questionId] || [];
      const exists = existing.includes(answerIndex);
      const next = exists ? existing.filter(i => i !== answerIndex) : [...existing, answerIndex];
      // Keep sorted for stable comparison/UI
      next.sort((a, b) => a - b);
      return { ...prev, [questionId]: next };
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const results = await quizApi.gradeQuiz(answers, module, seed);
      setQuizResults(results);
    } catch (err) {
      setError('Không thể chấm điểm. Vui lòng thử lại.');
      console.error('Error grading quiz:', err);
    } finally {
      setSubmitting(false);
    }
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

  // Show results after submission
  if (quizResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center">
              <div className="text-6xl mb-4">
                {quizResults.percentage >= 70 ? '🎉' : '😔'}
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Kết quả bài thi
              </h1>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {quizResults.score}/{quizResults.total}
              </div>
              <div className="text-2xl text-gray-600 mb-4">
                ({quizResults.percentage}%)
              </div>
              <div className={`text-lg font-medium ${quizResults.percentage >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                {quizResults.percentage >= 70 ? 'Chúc mừng! Bạn đã vượt qua bài thi!' : 'Cần cố gắng thêm nhé!'}
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-6">
              {quizResults.results.map((result, index) => (
                <div key={result.questionId} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex-1">
                      Câu {index + 1}: {result.questionText}
                    </h3>
                    <div className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                      result.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.isCorrect ? 'ĐÚNG 😊' : 'SAI ☹️'}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {result.options.map((option, optionIndex) => {
                      const correctSet = new Set(result.correctAnswer || []);
                      const userSet = new Set(result.userAnswer || []);

                      let bgColor = 'bg-gray-50';
                      let textColor = 'text-gray-700';
                      let borderColor = 'border-gray-200';

                      const isCorrectOption = correctSet.has(optionIndex);
                      const isUserSelected = userSet.has(optionIndex);

                      if (isCorrectOption) {
                        bgColor = 'bg-green-100';
                        textColor = 'text-green-800';
                        borderColor = 'border-green-300';
                      } else if (!result.isCorrect && isUserSelected) {
                        bgColor = 'bg-red-100';
                        textColor = 'text-red-800';
                        borderColor = 'border-red-300';
                      }

                      return (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${bgColor} ${textColor} ${borderColor}`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span> {option}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <strong>Giải thích:</strong> {result.explanation}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-8">
              <button
                onClick={handleRetry}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                🔄 Làm lại
              </button>
              <button
                onClick={handleBackToHome}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                🏠 Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show quiz interface
  const currentQuestion = questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(answers).length;
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
                <span>Đã trả lời: {answeredQuestions}/{questions.length}</span>
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
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    (answers[currentQuestion.id] || []).includes(index)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    name={`question-${currentQuestion.id}`}
                    value={index}
                    checked={(answers[currentQuestion.id] || []).includes(index)}
                    onChange={() => handleToggleAnswer(currentQuestion.id, index)}
                    className="mr-4 h-5 w-5 text-blue-600"
                  />
                  <span className="font-medium text-gray-800 mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              ← Câu trước
            </button>

            <div className="flex space-x-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[questions[index].id] !== undefined
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || answeredQuestions === 0}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang chấm điểm...' : 'Nộp bài'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Câu tiếp →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchModules } from '../services/api';

interface Module {
  name: string;
  id: string;
  total: number;
}

const Home: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadModules = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchModules();
        
        // Validate response structure
        if (!response || !Array.isArray(response.modules)) {
          throw new Error('Invalid response format from server');
        }
        
        const moduleList = response.modules.map((module: any) => ({
          name: module.name || 'Unknown Module',
          id: module.id || 'unknown',
          total: module.total || 0,
        }));
        
        setModules(moduleList);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Không tải được danh sách module: ${errorMessage}`);
        console.error('Error fetching modules:', err);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  const handleStartQuiz = () => {
    // Generate random seed for question shuffling
    const seed = Math.floor(Math.random() * 1000000);
    navigate(`/quiz?module=${selectedModule}&seed=${seed}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lỗi kết nối</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!modules.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
          <div className="text-gray-500 text-6xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Chưa có module nào</h2>
          <p className="text-gray-600">Vui lòng kiểm tra lại cấu hình backend.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🎓 Hệ thống luyện thi trực tuyến
            </h1>
            <p className="text-lg text-gray-600">
              Chọn module để bắt đầu làm bài thi
            </p>
          </div>

          {/* Module Selection */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Chọn module
            </h2>
            
            <div className="space-y-4 mb-8">
              {/* All Modules Option */}
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="module"
                  value="all"
                  checked={selectedModule === 'all'}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="mr-4 h-5 w-5 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-800">Tất cả module</div>
                  <div className="text-sm text-gray-500">Làm bài thi tổng hợp tất cả các module</div>
                </div>
              </label>

              {/* Individual Modules */}
              {modules.map((module) => (
                <label key={module.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="module"
                    value={module.id}
                    checked={selectedModule === module.id}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="mr-4 h-5 w-5 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-800">{module.name}</div>
                    <div className="text-sm text-gray-500">
                      Làm bài thi module {module.name} ({module.total} câu hỏi)
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartQuiz}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg"
            >
              🚀 Bắt đầu làm bài
            </button>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-800 mb-2">Hệ thống chấm điểm</h3>
              <p className="text-gray-600 text-sm">
                Chấm điểm tự động với phản hồi chi tiết cho từng câu hỏi
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-semibold text-gray-800 mb-2">Trộn câu hỏi</h3>
              <p className="text-gray-600 text-sm">
                Mỗi lần làm bài sẽ có thứ tự câu hỏi khác nhau
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

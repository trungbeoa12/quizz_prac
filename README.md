# Hệ thống luyện thi trực tuyến

Web app luyện thi với backend Flask và frontend React/TypeScript, đọc dữ liệu từ file Excel.

## Tính năng chính

- ✅ Đọc và parse dữ liệu từ file Excel
- ✅ Chọn module hoặc làm bài tổng hợp
- ✅ Trộn thứ tự câu hỏi theo seed (không trộn đáp án)
- ✅ Giao diện đẹp với TailwindCSS
- ✅ Chấm điểm tự động với phản hồi chi tiết
- ✅ Hiển thị đáp án đúng/sai với màu sắc
- ✅ Nút "Làm lại" để trộn lại câu hỏi

## Cấu trúc dự án

```
quizz_project/
├── backend/
│   └── app.py              # Flask API server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.tsx    # Trang chủ chọn module
│   │   │   └── Quiz.tsx    # Trang làm bài thi
│   │   ├── services/
│   │   │   └── api.ts      # API client
│   │   ├── types/
│   │   │   └── index.ts    # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── tailwind.config.js  # TailwindCSS config
│   └── package.json        # Frontend dependencies
├── Quyhoach_ModuleCDS.xlsx # File Excel chứa câu hỏi
├── requirements.txt        # Python dependencies
├── run_backend.sh         # Script chạy backend
├── run_frontend.sh        # Script chạy frontend
└── README.md              # File này
```

## API Endpoints

### Backend (Flask - Port 5000)

- `GET /api/modules` - Lấy danh sách module
- `GET /api/questions?module=<id|all>&seed=<num>` - Lấy câu hỏi (trộn thứ tự)
- `POST /api/grade` - Chấm điểm bài thi
- `GET /api/health` - Kiểm tra trạng thái server

### Frontend (React/CRA - Port 3000)

- `/` - Trang chủ chọn module
- `/quiz?module=<id>&seed=<num>` - Trang làm bài thi

## Cài đặt và chạy

### 1. Cài đặt dependencies

#### Backend
```bash
cd /home/trungdt2/Documents/quizz_project
pip install -r requirements.txt
```

#### Frontend
```bash
cd /home/trungdt2/Documents/quizz_project/frontend-simple
npm install
```

### 2. Chạy ứng dụng

#### Cách 1: Sử dụng script
```bash
# Chạy backend
./run_backend.sh

# Chạy frontend (terminal khác)
./run_frontend_simple.sh
```

#### Cách 2: Chạy thủ công
```bash
# Backend (terminal 1)
cd backend
python app.py

# Frontend (terminal 2)
cd frontend-simple
npm start
```

### 3. Truy cập ứng dụng

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Cấu trúc dữ liệu

### File Excel
- Sheet: "Quizizz Sample"
- Columns: Question, Option 1-6, Correct Option, Time (seconds)
- 68 câu hỏi từ 2 modules: "Chuyển đổi số" và "Module 1"

### JSON Format
```json
{
  "id": "q_1",
  "module": "Chuyển đổi số",
  "text": "Nội dung câu hỏi",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "Giải thích đáp án"
}
```

## Tính năng chi tiết

### Trang Home
- Hiển thị danh sách module từ API
- Chọn module cụ thể hoặc "Tất cả module"
- Giao diện đẹp với gradient và card layout

### Trang Quiz
- Progress bar hiển thị tiến độ
- Navigation giữa các câu hỏi
- Radio buttons cho đáp án (A, B, C, D)
- Hiển thị số câu đã trả lời
- Nút "Nộp bài" khi hoàn thành

### Kết quả thi
- Điểm số và phần trăm
- Chi tiết từng câu hỏi với màu sắc:
  - Xanh: Đáp án đúng
  - Đỏ: Đáp án sai của người dùng
- Giải thích cho mỗi câu
- Nút "Làm lại" để random seed mới

## Test cases

1. ✅ Chọn module cụ thể → chỉ hiện câu hỏi module đó
2. ✅ Chọn "Tất cả" → hiện câu hỏi từ tất cả module
3. ✅ Làm lại → đổi thứ tự câu hỏi, giữ nguyên thứ tự đáp án
4. ✅ Sau khi nộp → màu sắc, điểm, feedback hiện đúng

## Troubleshooting

### Backend không chạy được
- Kiểm tra Python version (cần 3.8+)
- Cài đặt lại dependencies: `pip install -r requirements.txt`
- Kiểm tra file Excel có tồn tại không

### Frontend không kết nối được API
- Đảm bảo backend đang chạy trên port 5000
- Kiểm tra CORS settings
- Xem console browser để debug

### Lỗi import pandas/numpy
```bash
pip install --upgrade pandas numpy
```

## Công nghệ sử dụng

### Backend
- Flask 2.3.3
- pandas 2.3.2
- openpyxl 3.1.2
- flask-cors 4.0.0

### Frontend
- React 18
- TypeScript
- Create React App
- TailwindCSS
- React Router DOM v6
- Axios

## Tác giả

Tạo bởi AI Assistant theo yêu cầu của user.

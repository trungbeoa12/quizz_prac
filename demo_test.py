#!/usr/bin/env python3
import requests
import json
import random

def test_quiz_app():
    """Test toàn bộ luồng của ứng dụng quiz"""
    base_url = "http://localhost:5000/api"
    
    print("🎓 DEMO HỆ THỐNG LUYỆN THI")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1. ✅ Kiểm tra trạng thái server...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"   - Server: {data['status']}")
            print(f"   - Tổng câu hỏi: {data['total_questions']}")
            print(f"   - Số module: {data['modules']}")
        else:
            print("   ❌ Server không hoạt động")
            return
    except Exception as e:
        print(f"   ❌ Lỗi kết nối: {e}")
        return
    
    # Test 2: Lấy danh sách modules
    print("\n2. 📚 Lấy danh sách modules...")
    try:
        response = requests.get(f"{base_url}/modules")
        if response.status_code == 200:
            data = response.json()
            modules = data['modules']
            print(f"   - Modules có sẵn: {modules}")
        else:
            print("   ❌ Không thể lấy modules")
            return
    except Exception as e:
        print(f"   ❌ Lỗi: {e}")
        return
    
    # Test 3: Lấy câu hỏi từ module "Chuyển đổi số"
    print("\n3. 📝 Lấy câu hỏi từ module 'Chuyển đổi số'...")
    module_name = "Chuyển đổi số"
    seed = 12345
    
    try:
        response = requests.get(f"{base_url}/questions", params={
            "module": module_name,
            "seed": seed
        })
        if response.status_code == 200:
            data = response.json()
            questions = data['questions']
            print(f"   - Số câu hỏi: {len(questions)}")
            print(f"   - Module: {data['module']}")
            print(f"   - Seed: {data['seed']}")
            
            # Hiển thị câu hỏi đầu tiên
            if questions:
                first_q = questions[0]
                print(f"   - Câu hỏi đầu tiên: {first_q['text'][:100]}...")
                print(f"   - Số đáp án: {len(first_q['options'])}")
        else:
            print("   ❌ Không thể lấy câu hỏi")
            return
    except Exception as e:
        print(f"   ❌ Lỗi: {e}")
        return
    
    # Test 4: Lấy câu hỏi từ tất cả modules
    print("\n4. 🌟 Lấy câu hỏi từ tất cả modules...")
    try:
        response = requests.get(f"{base_url}/questions", params={
            "module": "all",
            "seed": 54321
        })
        if response.status_code == 200:
            data = response.json()
            all_questions = data['questions']
            print(f"   - Tổng câu hỏi: {len(all_questions)}")
            print(f"   - Module: {data['module']}")
            print(f"   - Seed: {data['seed']}")
        else:
            print("   ❌ Không thể lấy câu hỏi")
            return
    except Exception as e:
        print(f"   ❌ Lỗi: {e}")
        return
    
    # Test 5: Test chấm điểm
    print("\n5. 🎯 Test chấm điểm...")
    try:
        # Giả lập câu trả lời (chọn ngẫu nhiên)
        answers = {}
        for i, q in enumerate(questions[:5]):  # Chỉ test 5 câu đầu
            answers[q['id']] = random.randint(0, len(q['options']) - 1)
        
        grade_data = {
            "answers": answers,
            "module": module_name,
            "seed": seed
        }
        
        response = requests.post(f"{base_url}/grade", json=grade_data)
        if response.status_code == 200:
            result = response.json()
            print(f"   - Điểm: {result['score']}/{result['total']}")
            print(f"   - Phần trăm: {result['percentage']}%")
            print(f"   - Số câu đúng: {sum(1 for r in result['results'] if r['isCorrect'])}")
            
            # Hiển thị kết quả chi tiết
            for i, res in enumerate(result['results'][:2]):  # Chỉ hiển thị 2 câu đầu
                status = "✅ ĐÚNG" if res['isCorrect'] else "❌ SAI"
                print(f"   - Câu {i+1}: {status}")
                print(f"     Đáp án chọn: {chr(65 + res['userAnswer'])}")
                print(f"     Đáp án đúng: {chr(65 + res['correctAnswer'])}")
        else:
            print("   ❌ Không thể chấm điểm")
            return
    except Exception as e:
        print(f"   ❌ Lỗi: {e}")
        return
    
    # Test 6: Test trộn câu hỏi
    print("\n6. 🔄 Test trộn câu hỏi với seed khác...")
    try:
        new_seed = 99999
        response = requests.get(f"{base_url}/questions", params={
            "module": module_name,
            "seed": new_seed
        })
        if response.status_code == 200:
            data = response.json()
            new_questions = data['questions']
            print(f"   - Seed mới: {new_seed}")
            print(f"   - Số câu hỏi: {len(new_questions)}")
            
            # So sánh thứ tự câu hỏi
            first_question_ids = [q['id'] for q in questions[:3]]
            new_first_question_ids = [q['id'] for q in new_questions[:3]]
            
            if first_question_ids != new_first_question_ids:
                print("   ✅ Thứ tự câu hỏi đã được trộn!")
            else:
                print("   ⚠️ Thứ tự câu hỏi giống nhau")
        else:
            print("   ❌ Không thể lấy câu hỏi với seed mới")
            return
    except Exception as e:
        print(f"   ❌ Lỗi: {e}")
        return
    
    print("\n" + "=" * 50)
    print("🎉 DEMO HOÀN THÀNH THÀNH CÔNG!")
    print("\n📱 Bạn có thể truy cập frontend tại:")
    print("   http://localhost:3000")
    print("\n🔧 API endpoints:")
    print("   - GET /api/modules")
    print("   - GET /api/questions?module=<id>&seed=<num>")
    print("   - POST /api/grade")
    print("   - GET /api/health")

if __name__ == "__main__":
    test_quiz_app()

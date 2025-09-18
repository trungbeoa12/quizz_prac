from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import random
import json
import os
from typing import List, Dict, Any

app = Flask(__name__)
CORS(app)

# Load questions data
QUESTIONS_DATA = []
MODULES = []

def load_questions_from_excel():
    """Load questions from Excel file and parse into standardized format"""
    global QUESTIONS_DATA, MODULES
    
    excel_file = "/home/trungdt2/Documents/quizz_project/Quyhoach_ModuleCDS.xlsx"
    
    try:
        df = pd.read_excel(excel_file, sheet_name="Quizizz Sample")
        
        questions = []
        for index, row in df.iterrows():
            # Skip empty rows
            if pd.isna(row['Question']) or str(row['Question']).strip() == '':
                continue
                
            # Extract options (only non-empty ones)
            options = []
            for i in range(1, 7):  # Option 1 to Option 6
                option_col = f'Option {i}'
                if option_col in df.columns and not pd.isna(row[option_col]):
                    option_text = str(row[option_col]).strip()
                    if option_text and option_text != 'nan':
                        options.append(option_text)
            
            if len(options) < 2:  # Skip if less than 2 options
                continue
                
            # Get correct answer indexes (support multiple values in "Correct Option")
            correct_option = row['Correct Option']
            correct_indexes: List[int] = []

            if not pd.isna(correct_option):
                # Accept formats like "1", "1,3", "1;3", "A,C", "a; c" etc.
                raw = str(correct_option)
                candidates: List[int] = []
                for token in [t.strip() for t in raw.replace(';', ',').split(',') if str(t).strip() != '']:
                    if token.isdigit():
                        candidates.append(int(token) - 1)
                    else:
                        # Try letter mapping A-F
                        upper = token.upper()
                        if len(upper) == 1 and 'A' <= upper <= 'F':
                            candidates.append(ord(upper) - ord('A'))
                # Filter invalid and unique while preserving order
                seen = set()
                for idx in candidates:
                    if 0 <= idx < len(options) and idx not in seen:
                        seen.add(idx)
                        correct_indexes.append(idx)

            # Fallback to first option if none parsed
            if len(correct_indexes) == 0:
                correct_indexes = [0]
                
            # Determine module from question text
            question_text = str(row['Question'])
            module = "Module 1"  # Default module
            
            if "CĐS" in question_text:
                module = "Chuyển đổi số"
            elif "AI" in question_text or "Trí tuệ nhân tạo" in question_text:
                module = "Trí tuệ nhân tạo"
            elif "Cloud" in question_text or "Điện toán đám mây" in question_text:
                module = "Điện toán đám mây"
            elif "Data" in question_text or "Dữ liệu" in question_text:
                module = "Dữ liệu và phân tích"
            
            question_data = {
                "id": f"q_{index}",
                "module": module,
                "text": question_text,
                "options": options,
                "correctIndexes": correct_indexes,
                "explanation": "Đáp án đúng: " + ", ".join([f"{chr(65 + i)}: {options[i]}" for i in correct_indexes])
            }
            
            questions.append(question_data)
        
        QUESTIONS_DATA = questions
        
        # Extract unique modules
        MODULES = list(set([q["module"] for q in questions]))
        MODULES.sort()
        
        print(f"Loaded {len(questions)} questions from {len(MODULES)} modules")
        print(f"Modules: {MODULES}")
        
    except Exception as e:
        print(f"Error loading Excel file: {e}")
        QUESTIONS_DATA = []
        MODULES = []

def get_shuffled_questions(module_filter: str = "all", seed: int = None) -> List[Dict[str, Any]]:
    """Get questions with shuffled order based on seed"""
    if seed is not None:
        random.seed(seed)
    
    # Filter by module
    filtered_questions = QUESTIONS_DATA
    if module_filter != "all" and module_filter in MODULES:
        filtered_questions = [q for q in QUESTIONS_DATA if q["module"] == module_filter]
    
    # Shuffle questions but keep options in original order
    shuffled_questions = filtered_questions.copy()
    random.shuffle(shuffled_questions)
    
    return shuffled_questions

# Initialize data on startup
load_questions_from_excel()

@app.route('/api/modules', methods=['GET'])
def get_modules():
    """Get list of available modules"""
    return jsonify({
        "modules": MODULES,
        "total": len(MODULES)
    })

@app.route('/api/questions', methods=['GET'])
def get_questions():
    """Get questions with optional module filter and seed for shuffling"""
    module = request.args.get('module', 'all')
    seed = request.args.get('seed', type=int)
    
    questions = get_shuffled_questions(module, seed)
    
    # Remove correctIndexes from response for security
    questions_for_client = []
    for q in questions:
        client_question = {
            "id": q["id"],
            "module": q["module"],
            "text": q["text"],
            "options": q["options"]
        }
        questions_for_client.append(client_question)
    
    return jsonify({
        "questions": questions_for_client,
        "total": len(questions_for_client),
        "module": module,
        "seed": seed
    })

@app.route('/api/grade', methods=['POST'])
def grade_quiz():
    """Grade the quiz and return results"""
    try:
        data = request.get_json()
        answers = data.get('answers', {})
        seed = data.get('seed')
        
        if not answers:
            return jsonify({"error": "No answers provided"}), 400
        
        # Get the same questions that were used (with same seed)
        module = data.get('module', 'all')
        questions = get_shuffled_questions(module, seed)
        
        # Create a lookup for correct answers (multiple allowed)
        correct_answers = {q["id"]: q.get("correctIndexes", []) for q in questions}
        
        results = []
        score = 0
        total = len(questions)
        
        for question in questions:
            question_id = question["id"]
            user_answer = answers.get(question_id)
            correct_answer_indexes = correct_answers.get(question_id, [])

            # Support single index or array of indexes from client
            user_answer_indexes: List[int] = []
            if isinstance(user_answer, list):
                user_answer_indexes = [int(i) for i in user_answer if isinstance(i, int)]
            elif isinstance(user_answer, int):
                user_answer_indexes = [user_answer]

            # Sort for comparison (order-insensitive)
            is_correct = sorted(user_answer_indexes) == sorted(correct_answer_indexes)
            
            if is_correct:
                score += 1
            
            result = {
                "questionId": question_id,
                "userAnswer": user_answer_indexes,
                "correctAnswer": correct_answer_indexes,
                "isCorrect": is_correct,
                "explanation": question["explanation"],
                "questionText": question["text"],
                "options": question["options"]
            }
            
            results.append(result)
        
        return jsonify({
            "score": score,
            "total": total,
            "percentage": round((score / total) * 100, 1) if total > 0 else 0,
            "results": results
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "total_questions": len(QUESTIONS_DATA),
        "modules": len(MODULES)
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

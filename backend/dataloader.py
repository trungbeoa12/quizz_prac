import os
import glob
import pandas as pd
from typing import Dict, Any, List


def _infer_module_from_filename(file_path: str) -> Dict[str, str]:
    """Infer module id and name from filename like Quyhoach_ModuleCDS.xlsx -> id: cds, name: Module CDS"""
    base = os.path.basename(file_path)
    name, _ = os.path.splitext(base)
    # Expect pattern Quyhoach_ModuleXXXX
    module_suffix = name.replace('Quyhoach_', '')  # ModuleCDS
    if module_suffix.lower().startswith('module'):
        mod = module_suffix[len('Module'):]
    else:
        mod = module_suffix
    mod = mod.strip()
    module_id = mod.lower()
    module_name = f"Module {mod.upper()}" if mod else "Module"
    return {"id": module_id, "name": module_name}


def parse_module(file_path: str) -> Dict[str, Any]:
    """Parse an Excel file into standardized module dict: {id, name, questions: [...], total}"""
    meta = _infer_module_from_filename(file_path)
    df = pd.read_excel(file_path, sheet_name="Quizizz Sample")

    questions: List[Dict[str, Any]] = []
    for index, row in df.iterrows():
        if pd.isna(row.get('Question')) or str(row.get('Question')).strip() == '':
            continue

        # Options
        options: List[str] = []
        for i in range(1, 7):
            col = f'Option {i}'
            if col in df.columns and not pd.isna(row.get(col)):
                text = str(row.get(col)).strip()
                if text and text != 'nan':
                    options.append(text)
        if len(options) < 2:
            continue

        # Correct options: support "1,3"; "A,C"
        correct_input = row.get('Correct Option')
        correct: List[int] = []
        if not pd.isna(correct_input):
            raw = str(correct_input)
            candidates: List[int] = []
            for token in [t.strip() for t in raw.replace(';', ',').split(',') if str(t).strip() != '']:
                if token.isdigit():
                    candidates.append(int(token) - 1)
                else:
                    up = token.upper()
                    if len(up) == 1 and 'A' <= up <= 'F':
                        candidates.append(ord(up) - ord('A'))
            seen = set()
            for idx in candidates:
                if 0 <= idx < len(options) and idx not in seen:
                    seen.add(idx)
                    correct.append(idx)
        if not correct:
            correct = [0]

        explanation = None
        if 'Explanation' in df.columns and not pd.isna(row.get('Explanation')):
            explanation = str(row.get('Explanation')).strip()

        questions.append({
            "id": f"{meta['id']}_q_{index}",
            "text": str(row.get('Question')).strip(),
            "options": options,
            "correct": correct,
            "multi": len(correct) > 1,
            "explanation": explanation,
        })

    return {
        "id": meta["id"],
        "name": meta["name"],
        "questions": questions,
        "total": len(questions),
    }


def load_all_modules(search_dirs: List[str]) -> Dict[str, Dict[str, Any]]:
    """Load all modules from any Quyhoach_*.xlsx in the given directories."""
    in_memory_db: Dict[str, Dict[str, Any]] = {}
    for d in search_dirs:
        if not d:
            continue
        for path in glob.glob(os.path.join(d, 'Quyhoach_*.xlsx')):
            try:
                module = parse_module(path)
                if module["total"] > 0:
                    in_memory_db[module["id"]] = module
            except Exception as e:
                # Skip corrupted files but continue loading others
                print(f"Failed to load {path}: {e}")
                continue
    return in_memory_db



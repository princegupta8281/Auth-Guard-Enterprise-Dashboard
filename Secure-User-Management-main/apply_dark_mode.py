import os
import re

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define replacements (regex mapping)
    replacements = {
        r'\bbg-white\b(?!\s*dark:)': 'bg-white dark:bg-slate-800',
        r'\bbg-slate-50\b(?!\s*dark:)': 'bg-slate-50 dark:bg-slate-900',
        r'\bbg-gray-50\b(?!\s*dark:)': 'bg-gray-50 dark:bg-slate-900',
        r'\btext-slate-900\b(?!\s*dark:)': 'text-slate-900 dark:text-white',
        r'\btext-gray-900\b(?!\s*dark:)': 'text-gray-900 dark:text-white',
        r'\btext-slate-800\b(?!\s*dark:)': 'text-slate-800 dark:text-slate-100',
        r'\btext-gray-800\b(?!\s*dark:)': 'text-gray-800 dark:text-slate-100',
        r'\btext-slate-700\b(?!\s*dark:)': 'text-slate-700 dark:text-slate-300',
        r'\btext-gray-700\b(?!\s*dark:)': 'text-gray-700 dark:text-slate-300',
        r'\btext-slate-600\b(?!\s*dark:)': 'text-slate-600 dark:text-slate-400',
        r'\btext-gray-600\b(?!\s*dark:)': 'text-gray-600 dark:text-slate-400',
        r'\btext-slate-500\b(?!\s*dark:)': 'text-slate-500 dark:text-slate-400',
        r'\btext-gray-500\b(?!\s*dark:)': 'text-gray-500 dark:text-slate-400',
        r'\bborder-slate-100\b(?!\s*dark:)': 'border-slate-100 dark:border-slate-700',
        r'\bborder-gray-100\b(?!\s*dark:)': 'border-gray-100 dark:border-slate-700',
        r'\bborder-slate-200\b(?!\s*dark:)': 'border-slate-200 dark:border-slate-700',
        r'\bborder-gray-200\b(?!\s*dark:)': 'border-gray-200 dark:border-slate-700',
        r'\bbg-white/50\b(?!\s*dark:)': 'bg-white/50 dark:bg-slate-800/50',
        r'\bbg-white/80\b(?!\s*dark:)': 'bg-white/80 dark:bg-slate-800/80',
        r'\bborder-white\b(?!\s*dark:)': 'border-white dark:border-slate-700',
    }

    new_content = content
    for pattern, replacement in replacements.items():
        new_content = re.sub(pattern, replacement, new_content)

    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

# Walk through frontend/src directory
frontend_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'src')

for root, _, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            process_file(os.path.join(root, file))

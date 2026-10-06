const fs = require('fs');
const path = require('path');

const replacements = [
    [/\bbg-white\b(?!\s*dark:)/g, 'bg-white dark:bg-slate-800'],
    [/\bbg-slate-50\b(?!\s*dark:)/g, 'bg-slate-50 dark:bg-slate-900'],
    [/\bbg-gray-50\b(?!\s*dark:)/g, 'bg-gray-50 dark:bg-slate-900'],
    [/\btext-slate-900\b(?!\s*dark:)/g, 'text-slate-900 dark:text-white'],
    [/\btext-gray-900\b(?!\s*dark:)/g, 'text-gray-900 dark:text-white'],
    [/\btext-slate-800\b(?!\s*dark:)/g, 'text-slate-800 dark:text-slate-100'],
    [/\btext-gray-800\b(?!\s*dark:)/g, 'text-gray-800 dark:text-slate-100'],
    [/\btext-slate-700\b(?!\s*dark:)/g, 'text-slate-700 dark:text-slate-300'],
    [/\btext-gray-700\b(?!\s*dark:)/g, 'text-gray-700 dark:text-slate-300'],
    [/\btext-slate-600\b(?!\s*dark:)/g, 'text-slate-600 dark:text-slate-400'],
    [/\btext-gray-600\b(?!\s*dark:)/g, 'text-gray-600 dark:text-slate-400'],
    [/\btext-slate-500\b(?!\s*dark:)/g, 'text-slate-500 dark:text-slate-400'],
    [/\btext-gray-500\b(?!\s*dark:)/g, 'text-gray-500 dark:text-slate-400'],
    [/\bborder-slate-100\b(?!\s*dark:)/g, 'border-slate-100 dark:border-slate-700'],
    [/\bborder-gray-100\b(?!\s*dark:)/g, 'border-gray-100 dark:border-slate-700'],
    [/\bborder-slate-200\b(?!\s*dark:)/g, 'border-slate-200 dark:border-slate-700'],
    [/\bborder-gray-200\b(?!\s*dark:)/g, 'border-gray-200 dark:border-slate-700'],
    [/\bbg-white\/50\b(?!\s*dark:)/g, 'bg-white/50 dark:bg-slate-800/50'],
    [/\bbg-white\/80\b(?!\s*dark:)/g, 'bg-white/80 dark:bg-slate-800/80'],
    [/\bborder-white\b(?!\s*dark:)/g, 'border-white dark:border-slate-700'],
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content;

    replacements.forEach(([pattern, replacement]) => {
        newContent = newContent.replace(pattern, replacement);
    });

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'frontend', 'src'));

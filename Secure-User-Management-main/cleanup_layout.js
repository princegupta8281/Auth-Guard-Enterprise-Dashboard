const fs = require('fs');
const path = require('path');

const replacements = [
    [/min-h-\[calc\(100vh-4rem\)\]/g, 'min-h-full'],
    // Also remove absolute background decorators from individual pages to prevent them from stacking weirdly inside the layout, 
    // since AuthenticatedLayout already has background decor.
    [/<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">[\s\S]*?<\/div>\s*<\/div>/g, ''], 
];

const authPages = ['Dashboard.jsx', 'Profile.jsx', 'AdminDashboard.jsx', 'Appointments.jsx', 'AuditLogs.jsx'];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content;

    replacements.forEach(([pattern, replacement]) => {
        newContent = newContent.replace(pattern, replacement);
    });
    
    // Specifically remove the background decor section if regex missed it
    newContent = newContent.replace(
      /{[^}]*\/\* Background Decor \*\//g, 
      ''
    );

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`Updated ${filePath}`);
    }
}

authPages.forEach(file => {
    const fullPath = path.join(__dirname, 'frontend', 'src', 'pages', file);
    if (fs.existsSync(fullPath)) {
        processFile(fullPath);
    }
});

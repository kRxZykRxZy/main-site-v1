const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
app.use(express.json());

const PROJECTS_DIR = path.join(__dirname, 'local_storage', 'projects');
const WORKSPACES_DIR = path.join(__dirname, 'workspaces');

// Ensure directories exist
if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR, { recursive: true });
if (!fs.existsSync(WORKSPACES_DIR)) fs.mkdirSync(WORKSPACES_DIR, { recursive: true });

// Create example project if it doesn't exist
const exampleProjectId = 'example';
const exampleProjectFile = path.join(PROJECTS_DIR, `${exampleProjectId}.json`);
if (!fs.existsSync(exampleProjectFile)) {
    const exampleProject = {
        files: {
            'index.js': `console.log('Hello from example project!');`,
            'README.md': `# Example Project\nThis is an example project loaded into VSCode iframe.`
        }
    };
    fs.writeFileSync(exampleProjectFile, JSON.stringify(exampleProject, null, 2));
    console.log('Created example project.');
}

// Start code-server on port 5733
let codeServerProcess = spawn('code-server', [
    '--port', '5733',
    '--auth', 'none',  // unsafe for production
    WORKSPACES_DIR
], { stdio: 'inherit' });

codeServerProcess.on('exit', (code) => {
    console.log(`code-server exited with code ${code}`);
});

// Helper: write project JSON to workspace folder
function loadProjectFiles(projectId) {
    const projectFile = path.join(PROJECTS_DIR, `${projectId}.json`);
    if (!fs.existsSync(projectFile)) throw new Error('Project not found');

    const projectData = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
    const projectWorkspace = path.join(WORKSPACES_DIR, projectId);

    if (!fs.existsSync(projectWorkspace)) fs.mkdirSync(projectWorkspace, { recursive: true });

    for (const [filename, content] of Object.entries(projectData.files)) {
        const filePath = path.join(projectWorkspace, filename);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
    }

    return projectWorkspace;
}

// Route: iframe page
app.get('/projects/:id', (req, res) => {
    const projectId = req.params.id;

    try {
        const workspacePath = loadProjectFiles(projectId);

        // Simple iframe page pointing to code-server
        res.send(`
            <html>
                <head>
                    <title>Project ${projectId}</title>
                    <style>
                        html, body { margin: 0; height: 100%; }
                        iframe { border: none; width: 100%; height: 100%; }
                    </style>
                </head>
                <body>
                    <iframe src="http://localhost:5733/?folder=${encodeURIComponent(workspacePath)}"></iframe>
                </body>
            </html>
        `);
    } catch (err) {
        res.status(404).send(err.message);
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Main server running on http://localhost:${PORT}`));

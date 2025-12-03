import express from 'express';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PROJECTS_DIR = path.join(__dirname, 'local_storage', 'projects');
const WORKSPACES_DIR = path.join(__dirname, 'workspaces');

// Ensure directories exist
if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR, { recursive: true });
if (!fs.existsSync(WORKSPACES_DIR)) fs.mkdirSync(WORKSPACES_DIR, { recursive: true });

// Create example project
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

// Helper to load project files
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

// Function to start code-server after installing
function installAndStartCodeServer() {
  console.log('Installing code-server...');
  const installer = spawn('sh', ['-c', 'curl -fsSL https://code-server.dev/install.sh | sh'], { stdio: 'inherit' });

  installer.on('exit', () => {
    console.log('Detecting code-server path...');
    const which = spawn('sh', ['-c', 'which code-server'], { stdio: ['ignore', 'pipe', 'pipe'] });

    let output = '';
    which.stdout.on('data', (data) => output += data.toString());
    which.stderr.on('data', (data) => console.error('which error:', data.toString()));

    which.on('exit', (code) => {
      const codeServerPath = output.trim();
      if (!codeServerPath) {
        console.error('❌ code-server not found after installation!');
        return;
      }
      console.log('✅ code-server path:', codeServerPath);

      const codeServer = spawn(codeServerPath, [
        '--port', '5733',
        '--auth', 'none',
        WORKSPACES_DIR
      ], { stdio: 'inherit' });

      codeServer.on('exit', (c) => console.log(`code-server exited with code ${c}`));
      codeServer.on('error', (e) => console.error('code-server error:', e));
    });
  });
}

// Start installation + code-server
installAndStartCodeServer();

// Route to serve iframe
app.get('/projects/:id', (req, res) => {
  const projectId = req.params.id;

  try {
    const workspacePath = loadProjectFiles(projectId);

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
          <iframe src="https://main-site-v1.onrender.com:5733/?folder=${encodeURIComponent(workspacePath)}"></iframe>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Main server running on http://localhost:${PORT}`));

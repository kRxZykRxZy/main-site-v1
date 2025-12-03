import express from 'express';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PROJECTS_DIR = path.join(__dirname, 'local_storage', 'projects');
const WORKSPACES_DIR = path.join(__dirname, 'workspaces');

// Ensure directories exist
fs.mkdirSync(PROJECTS_DIR, { recursive: true });
fs.mkdirSync(WORKSPACES_DIR, { recursive: true });

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

// Helper to copy project JSON into workspace folder
function loadProjectFiles(projectId) {
  const projectFile = path.join(PROJECTS_DIR, `${projectId}.json`);
  if (!fs.existsSync(projectFile)) throw new Error('Project not found');

  const projectData = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
  const projectWorkspace = path.join(WORKSPACES_DIR, projectId);

  fs.mkdirSync(projectWorkspace, { recursive: true });

  for (const [filename, content] of Object.entries(projectData.files)) {
    const filePath = path.join(projectWorkspace, filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }

  return projectWorkspace;
}

// Reverse proxy so iframe works in browser (Render-safe)
app.use('/vscode', createProxyMiddleware({
  target: 'http://127.0.0.1:5733',
  changeOrigin: true,
  ws: true,
  logLevel: 'silent'
}));

// Install code-server safely using the official non-root installer, then detect path & launch
console.log("Installing code-server...");
const installer = spawn('sh', ['-c', 'curl -fsSL https://code-server.dev/install.sh | sh'], { stdio: 'inherit' });

installer.on('exit', () => {
  console.log("Detecting code-server path...");
  const which = spawn('sh', ['-c', 'which code-server'], { stdio: ['ignore','pipe','pipe'] });

  let detectedPath = '';
  which.stdout.on('data', d => detectedPath += d.toString());

  which.on('exit', () => {
    const codeServerPath = detectedPath.trim();

    if (!codeServerPath) {
      console.error("❌ code-server not found after installation!");
      return;
    }

    console.log("✅ code-server path:", codeServerPath);
    console.log("Launching code-server...");

    const codeServer = spawn(codeServerPath, [
      '--port', '5733',
      '--auth', 'none',
      '--bind-addr', '0.0.0.0:5733',
      WORKSPACES_DIR
    ], { stdio: 'inherit' });

    codeServer.on('error', e => console.error("🔥 code-server error:", e));
  });
});

// Safety: prevent crashes
process.on('uncaughtException', e => console.error('❌ Uncaught Exception:', e));
process.on('unhandledRejection', e => console.error('❌ Unhandled Rejection:', e));

// Serve project in iframe editor
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
            iframe { width: 100%; height: 100%; border: none; }
          </style>
        </head>
        <body>
          <iframe src="/vscode/?folder=${encodeURIComponent(workspacePath)}"></iframe>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Main server running on port ${PORT}`));

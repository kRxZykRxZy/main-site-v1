import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function EditorPageWrapper() {
  const { id } = useParams();
  return <EditorPage id={id} />;
}

class EditorPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: null,
      username: null,
      projectType: null,
      codeFiles: {},
      loaded: false
    };

    this.editorInstances = {}; // { filename: monacoEditor }
    this.activeFile = "index.html";

    this.editorRef = React.createRef();
    this.previewRef = React.createRef();
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
  }

  async init() {
    const { id } = this.props;

    // Resolve user
    const username = await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        resolve(user ? user.displayName || user.email : null);
      });
    });
    const token = await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        const id = await user?.getIdToken();
        resolve(id);
      });
    });

    this.setState({ username });

    if (!username && id == 0) {
      this.setState({ redirect: "/account" });
      return;
    }

    // --- New project flow (unchanged)
    if (id == 0 && username) {
      const res = await fetch("https://sl-api-v1.onrender.com/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });
      const json = await res.json();
      this.setState({ redirect: `/projects/${json.id}` });
      return;
    }

    // --- Load project (code or blocks)
    const projectRes = await fetch(`https://sl-api-v1.onrender.com/api/project/${id}`);
    const projectJson = await projectRes.json();

    const projectType = projectJson.type; // "code" or "blocks"

    if (projectType === "blocks") {
      this.setState({ projectType, loaded: true });
      return;
    }

    // --- Code project ---
    const codeFiles = projectJson.files || {
      "index.html": "<h1>Hello</h1>",
      "style.css": "body{font-family:sans-serif;}",
      "script.js": "console.log('hi')"
    };

    this.setState({ projectType: "code", codeFiles, loaded: true });

    await this.loadMonaco();
    this.createEditors(codeFiles);
    this.startAutoSave(id);
    this.updatePreview();
  }

  //------------------------------------
  // LOAD MONACO EDITOR
  //------------------------------------
  loadMonaco() {
    return new Promise((resolve) => {
      if (window.monaco) return resolve();

      const loader = document.createElement("script");
      loader.src = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js";
      loader.onload = () => {
        window.require.config({
          paths: {
            vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs"
          }
        });

        window.require(["vs/editor/editor.main"], () => resolve());
      };
      document.body.appendChild(loader);
    });
  }

  //------------------------------------
  // CREATE MONACO INSTANCES
  //------------------------------------
  createEditors(files) {
    Object.keys(files).forEach((file) => {
      this.editorInstances[file] = window.monaco.editor.create(this.editorRef.current, {
        value: files[file],
        language: file.endsWith(".html")
          ? "html"
          : file.endsWith(".css")
          ? "css"
          : "javascript",
        theme: "vs-dark"
      });

      this.editorInstances[file].onDidChangeModelContent(() => {
        this.updatePreview();
      });
    });

    this.showFile("index.html");
  }

  //------------------------------------
  // SWITCH BETWEEN FILES
  //------------------------------------
  showFile(filename) {
    this.activeFile = filename;

    Object.keys(this.editorInstances).forEach((file) => {
      this.editorInstances[file].getDomNode().style.display =
        file === filename ? "block" : "none";
    });
  }

  //------------------------------------
  // UPDATE IFRAME PREVIEW
  //------------------------------------
  updatePreview() {
    if (!this.previewRef.current) return;

    const html = this.editorInstances["index.html"].getValue();
    const css = this.editorInstances["style.css"].getValue();
    const js = this.editorInstances["script.js"].getValue();

    const fullOutput = `
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}<\/script>
        </body>
      </html>
    `;

    this.previewRef.current.srcdoc = fullOutput;
  }

  //------------------------------------
  // AUTO SAVE (EVERY 3 SECONDS)
  //------------------------------------
  startAutoSave(projectId) {
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);

    this.autoSaveInterval = setInterval(async () => {
      try {
        const files = {};
        Object.keys(this.editorInstances).forEach((file) => {
          files[file] = this.editorInstances[file].getValue();
        });

        await fetch(`https://sl-api-v1.onrender.com/api/project/${projectId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files })
        });

        console.log("Auto-saved");
      } catch (e) {
        console.error("Auto-save failed:", e);
      }
    }, 3000);
  }

  //------------------------------------
  // RENDER
  //------------------------------------
  render() {
    const { redirect, loaded, projectType } = this.state;
    const id = this.props.id;

    if (redirect) return <Navigate to={redirect} replace />;
    if (!loaded) return <div>Loading...</div>;

    // ---------------- BLOCKS ----------------
    if (true) {
      const baseUrl = "https://myscratchblocks.github.io/scratch-gui/editor.html";
      const finalUrl = `${baseUrl}?username=${this.state.username || "test"}#${id}`;

      return (
        <iframe
          src={finalUrl}
          style={{ width: "100vw", height: "100vh", border: "none" }}
        />
      );
    }

    // ---------------- CODE ----------------
    return (
      <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
        {/* LEFT: File List */}
        <div style={{ width: "200px", background: "#222", color: "white", padding: "10px" }}>
          {["index.html", "style.css", "script.js"].map((file) => (
            <div
              key={file}
              onClick={() => this.showFile(file)}
              style={{
                padding: "8px",
                cursor: "pointer",
                background: this.activeFile === file ? "#444" : "transparent"
              }}
            >
              {file}
            </div>
          ))}
        </div>

        {/* CENTER: Editor */}
        <div
          ref={this.editorRef}
          style={{ flex: 1, height: "100vh", position: "relative" }}
        ></div>

        {/* RIGHT: Preview */}
        <iframe
          ref={this.previewRef}
          style={{ width: "40vw", height: "100vh", border: "none" }}
        />
      </div>
    );
  }
}

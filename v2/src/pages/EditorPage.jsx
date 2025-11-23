import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Wrapper to use useParams with a class component
export default function EditorPageWrapper() {
  const { id } = useParams();
  return <EditorPage id={Number(id)} />; // ensure id is a number
}

class EditorPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: null,
      username: null,
      loaded: false,
    };
    this.iframeRef = React.createRef();
    this.checkIframeInterval = null;
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    // Clear interval to avoid memory leaks
    if (this.checkIframeInterval) clearInterval(this.checkIframeInterval);
  }

  async init() {
    const { id } = this.props;

    // Get username
    const username = await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user ? user.displayName || user.email : null);
      });
    });

    this.setState({ username });

    // Redirect to account if not logged in and id is 0
    if (!username && id === 0) {
      this.setState({ redirect: "/account" });
      return;
    }

    // Create new project if id = 0 and user exists
    if (id === 0 && username) {
      const token = await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          unsubscribe();
          const idToken = await user?.getIdToken();
          resolve(idToken);
        });
      });

      const res = await fetch("https://sl-api-v1.onrender.com/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      const json = await res.json();
      if (json.id) {
        this.setState({ redirect: `/projects/${json.id}` });
        await addDoc(collection(db, "projects"), {
          id: json.id,
          title: "Untitled Project", 
          author: username, 
          date: new Date().toISOString().split("T")[0],
          createdAt: serverTimestamp(),
        });
        return;
      } else {
        alert(json.error);
        return;
      }
    }

    // Mark loaded
    this.setState({ loaded: true }, () => {
      // Start checking iframe after it's loaded
      this.startIframeMonitor();
    });
  }

  startIframeMonitor() {
    this.checkIframeInterval = setInterval(() => {
      const iframe = this.iframeRef.current;
      if (iframe && iframe.contentWindow) {
        try {
          const currentUrl = iframe.contentWindow.location.href;
          if (!currentUrl.includes("editor")) {
            // Redirect the top window to the iframe URL
            window.location.href = currentUrl;
          }
        } catch (e) {
          // Cross-origin restriction, fall back to iframe src
          const src = iframe.src;
          if (!src.includes("editor")) {
            window.location.href = src;
          }
        }
      }
    }, 1000); // check every 1 second
  }

  render() {
    const { redirect, loaded, username } = this.state;
    const { id } = this.props;

    if (redirect) return <Navigate to={redirect} replace />;
    if (!loaded) return <div>Loading...</div>;

    const baseUrl = "https://myscratchblocks.github.io/scratch-gui/editor.html";
    const finalUrl = `${baseUrl}?username=${username || "test"}#${id}`;

    return (
      <iframe
        ref={this.iframeRef}
        src={finalUrl}
        style={{ width: "100vw", height: "100vh", border: "none" }}
        title="Editor"
      />
    );
  }
}


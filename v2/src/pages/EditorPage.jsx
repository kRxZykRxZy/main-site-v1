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
  }

  componentDidMount() {
    this.init();
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
        return; // stop further execution
      } else {
        alert(json.error);
        return;
      }
    }

    this.setState({ loaded: true });
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
        src={finalUrl}
        style={{ width: "100vw", height: "100vh", border: "none" }}
        title="Editor"
      />
    );
  }
}

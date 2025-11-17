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

    if (!username && id == 0) {
      this.setState({ redirect: "/account" });
      return;
    }

    // Create new project if id = 0
    if (id == 0 && username) {
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
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });
      const json = await res.json();
      this.setState({ redirect: `/projects/${json.id}` });
      }
      return;
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
      />
    );
  }
}

import React from "react";
import { useParams, Navigate } from "react-router-dom";

// Wrapper to pass `id` from params to class component
export default function EditorPageWrapper() {
  const { id } = useParams();
  return <EditorPage id={id} />;
}

class EditorPage extends React.Component {
  constructor(props) {
    super(props);
    this.iframeRef = React.createRef();
    this.state = {
      redirect: null,
    };
  }

  componentDidMount() {
    this.init();
  }

  async init() {
    const { id } = this.props;
    const username = window.usernamw;
    const SECURE_ID = localStorage.getItem("SECURE_ID");

    if (!username && id == 0) {
      this.setState({ redirect: "/account" });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const remix = params.get("remix");

    if (remix && username) {
      try {
        const res = await fetch(
          `https://sl-api-v1.onrender.com/remix/${remix}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ remixId: remix, username }),
          }
        );
        const json = await res.json();
        this.setState({ redirect: `/projects#${json.id}` });
        return;
      } catch (err) {
        console.error("Remix error:", err);
      }
    }

    if (id == 0 && username && !remix) {
      try {
        const res = await fetch("https://sl-api-v1.onrender.com/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        const data = await res.json();
        if (data?.id) {
          localStorage.setItem("new-project", "true");
          this.setState({ redirect: `/projects/${data.id}` });
          return;
        }
      } catch (err) {
        console.error("Error sharing project:", err);
      }
    }

    // Set iframe src
    const hash = id || "0";
    const baseUrl = "https://MyScratchBlocks.ddns.net/scratch-gui/editor";
    const finalUrl = hash ? `${baseUrl}#${hash}` : baseUrl;
    if (this.iframeRef.current) {
      this.iframeRef.current.src = finalUrl;
    }
  }

  render() {
    const { redirect } = this.state;
    if (redirect) {
      return <Navigate to={redirect} replace />;
    }

    return (
      <div style={{ height: "100vh", width: "100vw", margin: 0, padding: 0 }}>
        <iframe
          ref={this.iframeRef}
          title="SnapLabs Editor"
          style={{ border: "none", width: "100%", height: "100%" }}
        />
      </div>
    );
  }
}

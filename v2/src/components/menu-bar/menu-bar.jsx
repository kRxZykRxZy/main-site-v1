import React from "react";
import { API } from "../../utils/api_base";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

class MenuBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mobileOpen: false,
      searchTerm: "",
      searchResults: [],
      showDropdown: false,

      user: null,
      pfpURL: "",
      dropdownOpen: false
    };
  }

  componentDidMount() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const username = user.displayName;
        this.setState({ user, username });

        // Load profile picture
        this.setState({
          pfpURL: `https://sl-api-v1.onrender.com/users/${username}/image`
        });
      } else {
        this.setState({ user: null, pfpURL: "" });
      }
    });
  }

  toggleMobileMenu = () => {
    this.setState((prev) => ({ mobileOpen: !prev.mobileOpen }));
  };

  toggleDropdown = () => {
    this.setState((prev) => ({ dropdownOpen: !prev.dropdownOpen }));
  };

  handleSearchChange = async (e) => {
    const value = e.target.value;
    this.setState({ searchTerm: value });

    if (!value.trim()) {
      this.setState({ searchResults: [], showDropdown: false });
      return;
    }

    try {
      const data = await API.getProjects();
      const filtered = data.projects
        .filter((p) => p.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);

      this.setState({ searchResults: filtered, showDropdown: true });
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  handleSearchSubmit = (e) => {
    e.preventDefault();
    const { searchTerm } = this.state;

    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  render() {
    const {
      mobileOpen,
      searchTerm,
      searchResults,
      showDropdown,
      pfpURL,
      user,
      dropdownOpen
    } = this.state;

    return (
      <header className="bg-[#f5f5f5] shadow-md border-b-2 border-purple-300 relative">
        <div className="w-full px-6 py-3 flex items-center justify-between">

          {/* ---------- LOGO (Scratch Style) ---------- */}
          <a href="/" className="flex items-center space-x-2">
            <svg width="90" height="35" viewBox="0 0 90 35">
              <text
                x="45"
                y="22"
                fontSize="18"
                fill="blue"
                fontWeight="bold"
                textAnchor="middle"
              >
                SnapLabs
              </text>
            </svg>
          </a>

          {/* ---------- NAV LINKS ---------- */}
          <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
            <a href="/projects/0/editor" className="hover:text-purple-600">Create</a>
            <a href="/community-projects" className="hover:text-purple-600">Explore</a>
            <a href="/AI-Assistant" className="hover:text-purple-600">Ideas</a>
          </nav>

          {/* ---------- SEARCH BAR (Scratch Style) ---------- */}
          <form
            onSubmit={this.handleSearchSubmit}
            className="relative hidden md:block w-1/3"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={this.handleSearchChange}
              placeholder="Search"
              className="w-full rounded-md bg-white border border-gray-300 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" strokeWidth="2" />
            </svg>

            {showDropdown && searchResults.length > 0 && (
              <ul className="absolute mt-2 w-full bg-white border rounded-lg shadow-lg z-20">
                {searchResults.map((proj) => (
                  <li
                    key={proj.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => (window.location.href = `/projects/${proj.id}`)}
                  >
                    {proj.name}
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* ---------- RIGHT SIDE USER AREA ---------- */}
          {user ? (
            <div className="relative">
              <img
                src={pfpURL}
                onClick={this.toggleDropdown}
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-purple-500"
                alt="pfp"
              />

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border z-30">
                  <a href={`/users/${username}`} className="block px-4 py-2 hover:bg-gray-100">Profile</a>
                  <a href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">My Stuff</a>
                  <a href="/account" className="block px-4 py-2 hover:bg-gray-100">Settings</a>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => auth.signOut()}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-4">
              <a href="/account" className="text-purple-600 font-semibold">Join</a>
              <a href="/account" className="text-gray-700 hover:text-purple-600">Sign In</a>
            </div>
          )}
        </div>
      </header>
    );
  }
}

export default MenuBar;

import React from "react";
import { API } from "../../utils/api_base";

class MenuBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mobileOpen: false,
      searchTerm: "",
      searchResults: [],
      showDropdown: false,
    };
  }

  toggleMobileMenu = () => {
    this.setState((prevState) => ({
      mobileOpen: !prevState.mobileOpen,
    }));
  };

  handleSearchChange = async (e) => {
    const value = e.target.value;
    this.setState({ searchTerm: value });

    if (value.trim().length === 0) {
      this.setState({ searchResults: [], showDropdown: false });
      return;
    }

    try {
      const data = await API.getProjects();
      const filtered = data.projects
        .filter((p) =>
          p.name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5); // top 5 results

      this.setState({ searchResults: filtered, showDropdown: true });
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  handleSearchSubmit = (e) => {
    e.preventDefault();
    const { searchTerm } = this.state;
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  render() {
    const { username } = this.props;
    const { mobileOpen, searchTerm, searchResults, showDropdown } = this.state;
    const showMessages = Boolean(username);

    return (
      <header className="bg-white shadow-sm py-4 relative z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center space-x-2 text-2xl font-bold text-indigo-600"
          >
            <span>SnapLabs</span>
          </a>

          {/* Search bar */}
          <form
            onSubmit={this.handleSearchSubmit}
            className="relative w-1/2 hidden md:block"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={this.handleSearchChange}
              placeholder="Search projects..."
              className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700"
            >
              Search
            </button>

            {/* Dropdown search results */}
            {showDropdown && searchResults.length > 0 && (
              <ul className="absolute left-0 mt-2 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                {searchResults.map((proj) => (
                  <li
                    key={proj.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/projects/${proj.id}`)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <img
                        src="/static/No%20Cover%20Available"
                        alt={proj.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <span className="text-gray-700">{proj.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="text-gray-600 hover:text-indigo-600 font-medium">
              Home
            </a>
            <a href="/community-projects" className="text-gray-600 hover:text-indigo-600 font-medium">
              Featured
            </a>
            <a href="/AI-Assistant" className="text-gray-600 hover:text-indigo-600 font-medium">
              AI
            </a>
            {showMessages && (
              <a href="/messages" className="text-gray-600 hover:text-indigo-600 font-medium">
                Messages
              </a>
            )}
            <a href="/account" className="text-gray-600 hover:text-indigo-600 font-medium">
              Dashboard
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={this.toggleMobileMenu}
            className="md:hidden text-gray-600 hover:text-indigo-600 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden bg-white py-2 shadow-md">
            <nav className="flex flex-col items-center space-y-2">
              <a href="/" className="text-gray-600 hover:text-indigo-600 font-medium py-1">
                Home
              </a>
              <a href="/community-projects" className="text-gray-600 hover:text-indigo-600 font-medium py-1">
                Featured
              </a>
              <a href="/AI-Assistant" className="text-gray-600 hover:text-indigo-600 font-medium py-1">
                AI
              </a>
              {showMessages && (
                <a href="/messages" className="text-gray-600 hover:text-indigo-600 font-medium py-1">
                  Messages
                </a>
              )}
              <a href="/account" className="text-gray-600 hover:text-indigo-600 font-medium py-1">
                Dashboard
              </a>
            </nav>
          </div>
        )}
      </header>
    );
  }
}

export default MenuBar;

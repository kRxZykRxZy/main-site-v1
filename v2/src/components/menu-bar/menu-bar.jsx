import React from "react";

class MenuBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mobileOpen: false,
    };
  }

  toggleMobileMenu = () => {
    this.setState((prevState) => ({
      mobileOpen: !prevState.mobileOpen,
    }));
  };

  render() {
    const { username } = this.props;
    const { mobileOpen } = this.state;
    const showMessages = Boolean(username);

    return (
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <a
            href="/"
            className="flex items-center space-x-2 text-2xl font-bold text-indigo-600"
          >
            <span>SnapLabs</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <a
              href="/"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200"
            >
              Home
            </a>
            <a
              href="/community-projects"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200"
            >
              Community Projects
            </a>
            <a
              href="/AI-Assistant"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200"
            >
              AI Assistant
            </a>
            {showMessages && (
              <a
                href="/messages"
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200"
              >
                Messages
              </a>
            )}
            <a
              href="/account"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200"
            >
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden bg-white py-2 shadow-md">
            <nav className="flex flex-col items-center space-y-2">
              <a
                href="/"
                className="block text-gray-600 hover:text-indigo-600 font-medium py-1"
              >
                Home
              </a>
              <a
                href="/community-projects"
                className="block text-gray-600 hover:text-indigo-600 font-medium py-1"
              >
                Community Projects
              </a>
              <a
                href="/AI-Assistant"
                className="block text-gray-600 hover:text-indigo-600 font-medium py-1"
              >
                AI Assistant
              </a>
              {showMessages && (
                <a
                  href="/messages"
                  className="block text-gray-600 hover:text-indigo-600 font-medium py-1"
                >
                  Messages
                </a>
              )}
              <a
                href="/account"
                className="block text-gray-600 hover:text-indigo-600 font-medium py-1"
              >
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

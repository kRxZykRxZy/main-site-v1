import React, { useEffect } from 'react';

const SplashScreen = () => {
  useEffect(() => {
    'use strict';

    let theme = '';
    let accent = '#ff4c4c';

    try {
      const themeSetting = localStorage.getItem('tw:theme');
      if (themeSetting === 'light') theme = 'light';
      else if (themeSetting === 'dark') theme = 'dark';
      else if (themeSetting) {
        const parsed = JSON.parse(themeSetting);
        if (parsed.accent === 'purple') accent = '#855cd6';
        else if (parsed.accent === 'blue') accent = '#4c97ff';
        if (parsed.gui === 'dark' || parsed.gui === 'light') theme = parsed.gui;
      }
    } catch (e) {
      // ignore
    }

    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    const splash = document.querySelector('.splash-waiting-for-js');
    if (splash) {
      splash.setAttribute('data-theme', theme);
      if (theme !== 'dark') {
        splash.style.backgroundColor = accent;
        splash.style.color = 'white';
      }
      splash.hidden = false;
    }

    const splashErrorTitle = document.querySelector('.splash-error-title');
    const splashError = document.querySelector('.splash-errors');
    const splashReset = document.querySelector('.splash-reset');

    let totalErrors = 0;
    window.onerror = function (event, source, line, col, err) {
      if (++totalErrors > 5) return;
      if (splashErrorTitle && splashError && splashReset) {
        splashErrorTitle.hidden = splashError.hidden = splashReset.hidden = false;
        const el = document.createElement('div');
        el.textContent = `Error (splash) in ${source} (${line}:${col}): ${err}`;
        splashError.appendChild(el);
      }
    };

    if (splashReset) {
      splashReset.onclick = function () {
        splashReset.disabled = true;
        function hardRefresh() {
          const search = location.search.replace(/[?&]nocache=\d+/, '');
          location.replace(location.pathname + search + (search ? '&' : '?') + 'nocache=' + Math.floor(Math.random() * 100000));
        }
        if ('serviceWorker' in navigator) {
          setTimeout(hardRefresh, 5000);
          navigator.serviceWorker
            .getRegistration('')
            .then((registration) => registration && registration.unregister())
            .then(hardRefresh)
            .catch(hardRefresh);
        } else {
          hardRefresh();
        }
      };
    }

    window.SplashEnd = () => {
      if (splash) splash.hidden = true;
      window.onerror = null;
    };
  }, []);

  return (
    <>
      <noscript>
        <div className="splash-screen">
          <div>
            <h1>SnapLabs requires JavaScript</h1>
            <p>
              Consider using{' '}
              <a href="https://desktop.turbowarp.org/">TurboWarp Desktop</a> if you are afraid of remote JavaScript.
            </p>
          </div>
        </div>
      </noscript>

      <div className="splash-screen splash-waiting-for-js" hidden>
        <div className="splash-spinner"></div>

        <div className="splash-error-title" hidden>
          Something went wrong.{' '}
          <a
            href="https://scratch.mit.edu/users/GarboMuffin/#comments"
            target="_blank"
            rel="noreferrer"
          >
            Please report
          </a>{' '}
          with the information below.
        </div>
        <div className="splash-errors" hidden></div>
        <button className="splash-reset" hidden>
          Click here to reset caches (can fix some errors)
        </button>
      </div>

      <div id="app"></div>

      {/* Scripts pointing to snaplabs.codeberg.page */}
      <script src="https://snaplabs.codeberg.page/idk/ampmod/js/vendors~addon-settings~credits~editor~embed~fullscreen~player.js"></script>
      <script src="https://snaplabs.codeberg.page/idk/ampmod/js/vendors~editor~embed~fullscreen~player.js"></script>
      <script src="https://snaplabs.codeberg.page/idk/ampmod/js/addon-settings~addons~editor~fullscreen~player.js"></script>
      <script src="https://snaplabs.codeberg.page/idk/ampmod/js/addon-settings~editor~embed~fullscreen~player.js"></script>
      <script src="https://snaplabs.codeberg.page/idk/ampmod/js/editor.js"></script>
    </>
  );
};

export default SplashScreen;

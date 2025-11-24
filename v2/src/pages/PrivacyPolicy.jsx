import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-4xl font-bold text-indigo-600 mb-6">SnapLabs Privacy Policy</h1>
        <p className="text-gray-700 mb-6">
          At <strong>SnapLabs</strong> we take privacy seriously. We don't track you or anything,
          we made this page since we need to do it. We are not interested in selling your data,
          all we want is to make a better Scratch editor.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">How we put this into force</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li><b>No Tracking</b> - We don't track you (and everyone else as well).</li>
          <li>
            <b>Privacy-Policy enforcing popups</b> - If a project you are running may breach a
            Privacy Violation if it was abused, a popup will show to make sure you are OK with it,
            and let you reject or accept it.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Random usernames</h2>
        <p className="text-gray-700 mb-4">
          If you are signed out, a non-identifying username will be used to greet you. If you are
          signed in, you will be greeted via your username, but we may make an option to force the
          random usernames later on. It is in the format of <strong>SnapLabs-Coder</strong> then a
          dash then 4 random numbers.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Settings</h2>
        <p className="text-gray-700 mb-4">
          Settings that you set, such as addons, are stored in your browser, not using a server.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">IPs</h2>
        <p className="text-gray-700 mb-4">
          IP addresses will not be abused, they will only be used to fight spam. For example, an IP
          may be blocked in response to abuse, but we will do nothing else with it.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Extensions</h2>
        <p className="text-gray-700 mb-4">
          Extensions are privacy-protected like how we said about the Privacy-Policy enforcing
          popups. Otherwise, privacy is protected under the Turbowarp Privacy Policy.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Accounts</h2>
        <p className="text-gray-700 mb-4">
          Accounts are protected, we don't sell your data or anything. Account logins are processed
          using ScratchID, which has a non-identifying, time-limited, and short-expiry token for
          verification to make sure there are no hackers. It even uses your Scratch Username.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Uploaded Projects</h2>
        <p className="text-gray-700 mb-4">
          Uploaded projects (on the SnapLabs Community) are only identified via username, nothing else.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Child Privacy</h2>
        <p className="text-gray-700 mb-4">
          If you find that your child has done things on SnapLabs with an account, and you don't want
          that, you have the right to get your child's account suspended and data deleted. To do this,
          follow the File a Claim steps below. You also need to be able to verify that you own the
          account, but that's easy as providing the "Developer Token".
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">File a claim</h2>
        <p className="text-gray-700">
          If you think that your or someone else's privacy is being violated, you can make a claim.
          Please contact <u><a href="mailto:contact@snaplabs.org">Our Administrators</a></u> or make an issue on our Github Repo.
          You may get and achievement on your profile for helpful feedback.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

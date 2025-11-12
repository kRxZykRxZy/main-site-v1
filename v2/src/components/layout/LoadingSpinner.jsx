import React from "react";

const SnapLabsSpinner = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-10">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
      <span className="text-gray-700 font-medium text-sm">Loading Your SnapLabs Workspace...</span>
    </div>
  );
};

export default SnapLabsSpinner;
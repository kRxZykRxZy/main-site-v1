import React from "react";
import "./layout.css";

const ErrorDisplay = ({ error, details }) => (
  <div className="error-display container mx-auto p-4 text-center">
    <h1 className="text-2xl font-bold text-red-600">Error</h1>
    <p className="text-gray-700">{error}</p>
    {details && <p className="text-sm text-gray-500">{details}</p>}
  </div>
);

export default ErrorDisplay;

import React from "react";

interface AppreciationPopupProps {
  onClose: () => void;
}

export function AppreciationPopup({ onClose }: AppreciationPopupProps) {
  return (
    <div className="chapter-stats-overlay" onClick={onClose}>
      <div className="chapter-stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chapter-stats-head">
          <div>
            <p className="chapter-stats-kicker">Mission Accomplished!</p>
            <h3 className="chapter-stats-title">Great Job!</h3>
            <p className="chapter-stats-subtitle">
              You've completed all your planned missions for the day. Keep up
              the excellent work!
            </p>
          </div>
          <button
            type="button"
            className="chapter-stats-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {/* You can add more celebratory elements here */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {/* Example icon, replace with your desired icon/animation */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "#fbbf24" }}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </div>
      </div>
    </div>
  );
}

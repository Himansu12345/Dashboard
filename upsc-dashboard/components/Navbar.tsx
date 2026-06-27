"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const prelimsSubjects = [
  { label: "Polity", href: "/polity" },
  { label: "Geography", href: "/geography" },
  { label: "Economics", href: "/economics" },
  { label: "Ancient", href: "/ancient-history" },
  { label: "Medival" },
  { label: "Modern History", href: "/modern-history" },
  { label: "Art&Culture", href: "/art-culture" },
  { label: "Sc&tech", href: "/sc-tech" },
  { label: "Environment" },
  { label: "Society", href: "/society" },
  { label: "World History", href: "/world-history" },
  { label: "Social Justice", href: "/social-justice" },
  { label: "Governance", href: "/governance" },
  { label: "IR", href: "/international-relations" },
  { label: "Agriculture", href: "/agriculture" },
  { label: "Internal Security", href: "/internal-security" },
  { label: "Disaster Mgmt", href: "/disaster-management" },
];

export default function Navbar() {
  const pathname = usePathname();

  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSubjectsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="app-nav glass-panel">
      <div className="app-title-wrap">
        <p className="app-eyebrow">Adaptive Practice Intelligence</p>
        <h1 className="app-title">UPSC Dashboard</h1>
      </div>

      <nav className="app-nav-links" aria-label="Primary">
        <Link
          href="/"
          className={`nav-pill ripple-btn ${pathname === "/" ? "is-active" : ""}`}
        >
          Dashboard
        </Link>
        <Link
          href="/accuracy"
          className={`nav-pill ripple-btn ${pathname === "/accuracy" ? "is-active" : ""}`}
        >
          Accuracy
        </Link>
        <Link
          href="/table"
          className={`nav-pill ripple-btn ${pathname === "/table" ? "is-active" : ""}`}
        >
          Table
        </Link>
        <Link
          href="/mcq-quiz"
          className={`nav-pill ripple-btn ${pathname === "/mcq-quiz" ? "is-active" : ""}`}
        >
          MCQ Quiz
        </Link>
        <Link
          href="/report"
          className={`nav-pill ripple-btn ${pathname === "/report" ? "is-active" : ""}`}
        >
          Report
        </Link>
        {/* <Link
          href="/streak"
          className={`nav-pill ripple-btn ${pathname === "/streak" ? "is-active" : ""}`}
        >
          Streak
        </Link> */}

        <div className="relative flex flex-1 flex-col" ref={dropdownRef}>
          <button
            type="button"
            className={`nav-pill ripple-btn w-full ${isSubjectsOpen || prelimsSubjects.some((s) => s.href === pathname) ? "is-active" : ""}`}
            onClick={() => setIsSubjectsOpen(!isSubjectsOpen)}
          >
            Subjects
          </button>

          {isSubjectsOpen && (
            <div
              className="glass-panel"
              style={{
                position: "absolute",
                top: "calc(100% + 0.5rem)",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                minWidth: "160px",
                padding: "0.5rem",
                gap: "0.25rem",
                zIndex: 100,
              }}
            >
              {prelimsSubjects.map((subject) => {
                const isActive = Boolean(
                  subject.href && pathname === subject.href,
                );
                if (subject.href) {
                  return (
                    <Link
                      key={subject.label}
                      href={subject.href}
                      onClick={() => setIsSubjectsOpen(false)}
                      className={`prelims-subject-pill ripple-btn ${isActive ? "is-active" : ""}`}
                      style={{
                        textAlign: "center",
                        width: "100%",
                        display: "block",
                      }}
                    >
                      {subject.label}
                    </Link>
                  );
                }
                return (
                  <span
                    key={subject.label}
                    className="prelims-subject-pill is-static"
                    style={{
                      textAlign: "center",
                      width: "100%",
                      display: "block",
                      opacity: 0.5,
                      cursor: "not-allowed",
                    }}
                  >
                    {subject.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* <button
          type="button"
          className={`nav-pill ripple-btn ${isConsistencyPopupOpen ? "is-active" : ""}`}
          onClick={() => dispatch(openConsistencyPopup("overview"))}
        >
          Consistency
        </button> */}
        {/* <button
          type="button"
          className={`nav-pill ripple-btn ${isNotesPopupOpen ? "is-active" : ""}`}
          onClick={() => dispatch(setNotesPopupOpen(true))}
        >
          Note
        </button> */}
      </nav>
    </header>
  );
}

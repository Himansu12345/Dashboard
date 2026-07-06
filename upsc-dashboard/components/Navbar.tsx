"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Subject = {
  label: string;
  href?: string;
};

type SubjectSectionKey = "pre" | "mains" | "preMains";

type SubjectSection = {
  key: SubjectSectionKey;
  label: string;
  subjects: Subject[];
};

const subjectSections: SubjectSection[] = [
  {
    key: "pre",
    label: "Pre",
    subjects: [
      { label: "Ancient", href: "/ancient-history" },
      { label: "Medival" },
      { label: "Sc&tech", href: "/sc-tech" },
      { label: "Environment" },
    ],
  },
  {
    key: "mains",
    label: "Mains",
    subjects: [
      { label: "Society", href: "/society" },
      { label: "World History", href: "/world-history" },
      { label: "Social Justice", href: "/social-justice" },
      { label: "Governance", href: "/governance" },
      { label: "IR", href: "/international-relations" },
      { label: "Internal Security", href: "/internal-security" },
      { label: "Disaster Mgmt", href: "/disaster-management" },
    ],
  },
  {
    key: "preMains",
    label: "Pre+Mains",
    subjects: [
      { label: "Polity", href: "/polity" },
      { label: "Geography", href: "/geography" },
      { label: "Economics", href: "/economics" },
      { label: "Modern History", href: "/modern-history" },
      { label: "Art&Culture", href: "/art-culture" },
      { label: "Agriculture", href: "/agriculture" },
    ],
  },
];

const allSubjects = subjectSections.flatMap((section) => section.subjects);

const getSectionForPath = (pathname: string): SubjectSectionKey =>
  subjectSections.find((section) =>
    section.subjects.some((subject) => subject.href === pathname),
  )?.key ?? "pre";

const getSubjectsForSection = (sectionKey: SubjectSectionKey) =>
  subjectSections.find((section) => section.key === sectionKey)?.subjects ??
  subjectSections[0].subjects;

export default function Navbar() {
  const pathname = usePathname();

  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [selectedSection, setSelectedSection] =
    useState<SubjectSectionKey>("pre");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const visibleSubjects = getSubjectsForSection(selectedSection);

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

  useEffect(() => {
    setSelectedSection(getSectionForPath(pathname));
  }, [pathname]);

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
            className={`nav-pill ripple-btn w-full ${isSubjectsOpen || allSubjects.some((s) => s.href === pathname) ? "is-active" : ""}`}
            onClick={() => setIsSubjectsOpen(!isSubjectsOpen)}
          >
            Subjects
          </button>

          {isSubjectsOpen && (
            <div className="subjects-dropdown glass-panel">
              <div
                className="subject-section-switch"
                role="tablist"
                aria-label="Subject sections"
              >
                {subjectSections.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    role="tab"
                    aria-selected={selectedSection === section.key}
                    className={`subject-section-tab ripple-btn ${selectedSection === section.key ? "is-active" : ""}`}
                    onClick={() => setSelectedSection(section.key)}
                  >
                    {section.label}
                  </button>
                ))}
              </div>

              <div className="subject-dropdown-list">
                {visibleSubjects.map((subject) => {
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
                      >
                        {subject.label}
                      </Link>
                    );
                  }
                  return (
                    <span
                      key={subject.label}
                      className="prelims-subject-pill is-static"
                    >
                      {subject.label}
                    </span>
                  );
                })}
              </div>
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

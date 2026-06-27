"use client";

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
];

export default function PrelimsSubjectBar() {
  const pathname = usePathname();

  return (
    <nav className="prelims-subject-bar glass-panel" aria-label="Prelims subjects">
      {prelimsSubjects.map((subject) => {
        const isActive = Boolean(subject.href && pathname === subject.href);

        if (subject.href) {
          return (
            <Link
              key={subject.label}
              href={subject.href}
              className={`prelims-subject-pill ripple-btn ${isActive ? "is-active" : ""}`}
            >
              {subject.label}
            </Link>
          );
        }

        return (
          <span key={subject.label} className="prelims-subject-pill is-static">
            {subject.label}
          </span>
        );
      })}
    </nav>
  );
}

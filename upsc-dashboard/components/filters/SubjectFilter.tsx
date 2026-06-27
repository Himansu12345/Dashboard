interface SubjectFilterProps {
  id: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export default function SubjectFilter({ id, value, options, onChange }: SubjectFilterProps) {
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <label className="dashboard-filter-field" htmlFor={id}>
      <span className="dashboard-filter-label">Subject</span>
      <select
        id={id}
        value={value || safeOptions[0] || ""}
        onChange={(event) => onChange(event.target.value)}
        className="field-control dashboard-filter-control"
      >
        {safeOptions.map((subject) => (
          <option key={subject} value={subject}>
            {subject}
          </option>
        ))}
      </select>
    </label>
  );
}

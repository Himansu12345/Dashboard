interface DifficultyFilterProps {
  id: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export default function DifficultyFilter({ id, value, options, onChange }: DifficultyFilterProps) {
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <label className="dashboard-filter-field" htmlFor={id}>
      <span className="dashboard-filter-label">Difficulty</span>
      <select
        id={id}
        value={value || safeOptions[0] || ""}
        onChange={(event) => onChange(event.target.value)}
        className="field-control dashboard-filter-control"
      >
        {safeOptions.map((difficulty) => (
          <option key={difficulty} value={difficulty}>
            {difficulty}
          </option>
        ))}
      </select>
    </label>
  );
}

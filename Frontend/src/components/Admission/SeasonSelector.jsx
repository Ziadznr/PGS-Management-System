const SeasonSelector = ({ formData, setFormData, seasons }) => {
  return (
    <div className="mb-3">
      <label className="form-label">Admission Season</label>

      <select
        className="form-control"
        value={formData.admissionSeason}
        onChange={(e) =>
          setFormData({
            ...formData,
            admissionSeason: e.target.value,
            academicYear: seasons.find(s => s._id === e.target.value)?.academicYear
          })
        }
      >
        <option value="">Select Season</option>

        {seasons.map((s) => (
          <option key={s._id} value={s._id}>
            {s.seasonName} {s.academicYear}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SeasonSelector;

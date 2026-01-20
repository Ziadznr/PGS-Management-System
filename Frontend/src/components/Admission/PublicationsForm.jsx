const PublicationsForm = ({ formData, setFormData }) => {
  const count = formData.numberOfPublications || 0;

  const updateLink = (index, value) => {
    const updated = [...(formData.publications || [])];
    updated[index] = value;

    setFormData(prev => ({
      ...prev,
      publications: updated
    }));
  };

  return (
    <div className="card p-3 mt-3">
      <h5>
        11. Number of Publications
      </h5>

      <p className="text-muted">
        (Enclose the publication website link(s))
      </p>

      {/* NUMBER INPUT */}
      <input
        type="number"
        min="0"
        className="form-control mb-3"
        placeholder="Enter number of publications"
        value={count}
        onChange={e => {
          const value = Number(e.target.value);

          setFormData(prev => ({
            ...prev,
            numberOfPublications: value,
            publications:
              value > 0
                ? Array(value).fill("")
                : []
          }));
        }}
        required
      />

      {/* PUBLICATION LINKS */}
      {count > 0 && (
        <>
          <h6 className="mt-3">
            Publication Website Link(s)
          </h6>

          {formData.publications.map((link, index) => (
            <input
              key={index}
              type="url"
              className="form-control mb-2"
              placeholder={`Publication ${index + 1} URL`}
              value={link}
              onChange={e =>
                updateLink(index, e.target.value)
              }
              required
            />
          ))}

          <small className="text-danger">
            All publication links are mandatory
          </small>
        </>
      )}
    </div>
  );
};

export default PublicationsForm;

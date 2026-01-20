const Declaration = ({ formData, setFormData }) => {
  return (
    <div className="card mt-3 p-3">
      <h6 className="fw-bold mb-2">Declaration</h6>

      <p className="text-justify mb-3">
        I do hereby declare that:
        <br />
        (a) The information mentioned in this application is true and correct to
        the best of my knowledge. If any information is found to be false, my
        candidature shall automatically be cancelled;
        <br />
        (b) I shall abide by all the rules and regulations of the University if
        admitted; and
        <br />
        (c) I shall not take part in any activity subversive of the University,
        the State, or of discipline.
      </p>

      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="declarationAccepted"
          checked={formData.declarationAccepted || false}
          onChange={(e) =>
            setFormData({
              ...formData,
              declarationAccepted: e.target.checked
            })
          }
          required
        />
        <label
          htmlFor="declarationAccepted"
          className="form-check-label"
        >
          I have read and agree to the above declaration.
        </label>
      </div>
    </div>
  );
};

export default Declaration;

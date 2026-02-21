import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUserProfile } from "../services/auth";

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const parseCsv = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) =>
    header.toLowerCase().trim()
  );

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row;
  });
};

const parseList = (value) => {
  if (!value) return [];
  return value
    .split(/[|;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseVaccinationsCell = (value) => {
  if (!value) return [];
  return value
    .split(/[|;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((entry) => {
      const [vaccineName, dateTaken] = entry.split(/[:@]/).map((part) => part?.trim() || "");
      return { vaccineName, dateTaken };
    })
    .filter((item) => item.vaccineName || item.dateTaken);
};

const getInitialName = () => {
  const pendingName = sessionStorage.getItem("patient_signup_name");
  if (pendingName) return pendingName;

  try {
    const authUser = JSON.parse(sessionStorage.getItem("auth_user") || "{}");
    if (authUser?.name) return authUser.name;
  } catch {
    // Ignore invalid stored JSON.
  }

  return "";
};

export default function FirstTimeUser() {
  const navigate = useNavigate();
  const csvInputRef = useRef(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [conditionInput, setConditionInput] = useState("");
  const [conditions, setConditions] = useState([]);
  const [vaccinations, setVaccinations] = useState([
    { vaccineName: "", dateTaken: "" },
  ]);
  const [csvError, setCsvError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initialName = getInitialName();
    if (!initialName) return;
    const [first = "", ...rest] = initialName.split(/\s+/);
    setFirstName(first.replace(/[^a-zA-Z]/g, ""));
    setLastName(rest.join(" ").replace(/[^a-zA-Z]/g, ""));
  }, []);

  const addCondition = () => {
    const value = conditionInput.trim();
    if (!value) return;
    if (conditions.includes(value)) return;
    setConditions((prev) => [...prev, value]);
    setConditionInput("");
  };

  const removeCondition = (value) => {
    setConditions((prev) => prev.filter((item) => item !== value));
  };

  const updateVaccination = (index, field, value) => {
    setVaccinations((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addVaccinationRow = () => {
    setVaccinations((prev) => [
      ...prev,
      { vaccineName: "", dateTaken: "" },
    ]);
  };

  const removeVaccinationRow = (index) => {
    setVaccinations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const hasValidVaccination = vaccinations.some(
      (item) => item.vaccineName.trim() && item.dateTaken
    );

    if (!firstName.trim() || !lastName.trim() || !dob || !hasValidVaccination) {
      setSubmitError("Please fill first name, last name, DOB, and at least one vaccination with a date.");
      return;
    }

    const token = sessionStorage.getItem("auth_token") || "";
    if (!token) {
      setSubmitError("Missing auth token. Please login again and retry.");
      return;
    }

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();

    setIsSaving(true);
    setSubmitError("");

    try {
      await updateUserProfile({
        token,
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
        birth: dob,
        conditions,
      });
    } catch (error) {
      setSubmitError(error?.message || "Failed to save profile to backend.");
      setIsSaving(false);
      return;
    }

    const fullName = `${normalizedFirstName} ${normalizedLastName}`.trim();
    sessionStorage.setItem(
      "patient_profile",
      JSON.stringify({
        name: fullName,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        dob,
        conditions,
        vaccinations
      })
    );
    sessionStorage.removeItem("patient_signup_name");
    navigate("/user/dashboard");
  };

  const handleCsvUploadClick = () => {
    csvInputRef.current?.click();
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvError("");

    try {
      const text = await file.text();
      const rows = parseCsv(text);

      if (!rows.length) {
        setCsvError("CSV is empty or missing data rows.");
        return;
      }

      const firstRow = rows[0];

      const csvFirstName = firstRow.firstname || firstRow.first_name || "";
      const csvLastName = firstRow.lastname || firstRow.last_name || "";
      const csvName = firstRow.name || "";
      const csvDob = firstRow.dob || firstRow.dateofbirth || firstRow["date_of_birth"] || "";
      const csvConditions =
        parseList(firstRow.conditions || firstRow.condition || firstRow.chronicconditions || firstRow["chronic_conditions"]);

      let csvVaccinations = [];
      const hasPerRowVaccine = rows.some((row) => row.vaccinename || row.vaccine || row["vaccine_name"]);

      if (hasPerRowVaccine) {
        csvVaccinations = rows
          .map((row) => ({
            vaccineName: row.vaccinename || row.vaccine || row["vaccine_name"] || "",
            dateTaken: row.datetaken || row.date || row["date_taken"] || "",
          }))
          .filter((item) => item.vaccineName || item.dateTaken);
      } else {
        csvVaccinations = parseVaccinationsCell(
          firstRow.vaccinations || firstRow.vaccinationhistory || firstRow["vaccination_history"]
        );
      }

      if (csvFirstName || csvLastName) {
        if (csvFirstName) setFirstName(String(csvFirstName).replace(/[^a-zA-Z]/g, ""));
        if (csvLastName) setLastName(String(csvLastName).replace(/[^a-zA-Z]/g, ""));
      } else if (csvName) {
        const [first = "", ...rest] = String(csvName).trim().split(/\s+/);
        setFirstName(first.replace(/[^a-zA-Z]/g, ""));
        setLastName(rest.join(" ").replace(/[^a-zA-Z]/g, ""));
      }
      if (csvDob) setDob(csvDob);
      if (csvConditions.length) setConditions(csvConditions);
      if (csvVaccinations.length) setVaccinations(csvVaccinations);
    } catch {
      setCsvError("Unable to read CSV file.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <main className="page">
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-card-head">
          <h1>Patient First-Time Setup</h1>
          <button
            type="button"
            className="small-btn csv-upload-btn"
            onClick={handleCsvUploadClick}
          >
            Upload Profile (CSV)
          </button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="visually-hidden-input"
            onChange={handleCsvUpload}
          />
        </div>

        {csvError ? <p className="csv-error">{csvError}</p> : null}
        {submitError ? <p className="csv-error">{submitError}</p> : null}

        <div className="form-grid">
          <label htmlFor="patient-first-name">First Name:</label>
          <input
            type="text"
            id="patient-first-name"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value.replace(/[^a-zA-Z]/g, ""))}
          />

          <label htmlFor="patient-last-name">Last Name:</label>
          <input
            type="text"
            id="patient-last-name"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value.replace(/[^a-zA-Z]/g, ""))}
          />

          <label htmlFor="patient-dob">DOB:</label>
          <input
            type="date"
            id="patient-dob"
            name="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />

          <label htmlFor="patient-condition-input">Chronic Conditions:</label>
          <div className="list-input-wrap">
            <div className="list-input-row">
              <input
                type="text"
                id="patient-condition-input"
                value={conditionInput}
                onChange={(e) => setConditionInput(e.target.value)}
                placeholder="Type condition and click Add"
              />
              <button type="button" className="small-btn" onClick={addCondition}>
                Add
              </button>
            </div>
            <div className="tag-list">
              {conditions.map((item) => (
                <span key={item} className="tag-chip">
                  {item}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => removeCondition(item)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <label>Vaccination History:</label>
          <div className="vax-history">
            {vaccinations.map((vaccine, index) => (
              <div key={index} className="vax-row">
                <input
                  type="text"
                  placeholder="Vaccine name"
                  value={vaccine.vaccineName}
                  onChange={(e) =>
                    updateVaccination(index, "vaccineName", e.target.value)
                  }
                />
                <input
                  type="date"
                  value={vaccine.dateTaken}
                  onChange={(e) =>
                    updateVaccination(index, "dateTaken", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="small-btn danger-btn"
                  onClick={() => removeVaccinationRow(index)}
                  disabled={vaccinations.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="small-btn" onClick={addVaccinationRow}>
              Add Vaccine
            </button>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

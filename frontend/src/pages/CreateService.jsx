import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import "./CreateService.css";

export default function CreateService() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    url: "",
    checkInterval: "",
    timeout: "",
    failureThreshold: "",
    successThreshold: "",
    alertEmail: "",
    webhookUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/services", {
        name: form.name,
        url: form.url,
        checkInterval: Number(form.checkInterval),
        timeout: Number(form.timeout),
        failureThreshold: Number(form.failureThreshold),
        successThreshold: Number(form.successThreshold),
        alertEmail: form.alertEmail,
        webhookUrl: form.webhookUrl,
      });

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create service"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="logo" onClick={() => navigate("/")}>
          Uptime Monitor
        </div>
      </header>

      {/* Form */}
      <main className="content">
        <h2>Create Service</h2>

        <form className="form" onSubmit={handleSubmit}>
          <FormField
            label="Service Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <FormField
            label="URL"
            name="url"
            value={form.url}
            onChange={handleChange}
            required
          />

          <FormField
            label="Check Interval (secs)"
            name="checkInterval"
            value={form.checkInterval}
            onChange={handleChange}
            info="Time interval between each check in seconds"
            required
          />

          <FormField
            label="Timeout (secs)"
            name="timeout"
            value={form.timeout}
            onChange={handleChange}
            info="Maximum time to wait for a response before marking the check as failed"
            required
          />

          <FormField
            label="Failure Threshold"
            name="failureThreshold"
            value={form.failureThreshold}
            onChange={handleChange}
            info="Number of consecutive failed checks required to mark the service as DOWN"
            required
          />

          <FormField
            label="Success Threshold"
            name="successThreshold"
            value={form.successThreshold}
            onChange={handleChange}
            info="Number of consecutive successful checks required to mark the service as UP"
            required
          />

          <FormField
            label="Alert Email"
            name="alertEmail"
            value={form.alertEmail}
            onChange={handleChange}
            info="Email address where incident alerts will be sent"
          />

          <FormField
            label="Discord Webhook URL"
            name="webhookUrl"
            value={form.webhookUrl}
            onChange={handleChange}
            info="Discord webhook URL to send incident notifications"
          />

          {error && <p className="error">{error}</p>}

          <button
            className="submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Service"}
          </button>
        </form>
      </main>
    </div>
  );
}

/* Reusable field with tooltip */
function FormField({ label, name, value, onChange, info, required }) {
  return (
    <div className="field">
      <label>
        {label}
        {info && (
          <span className="info">
            ⓘ
            <span className="tooltip">{info}</span>
          </span>
        )}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}
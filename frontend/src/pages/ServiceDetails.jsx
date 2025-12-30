import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import "./ServiceDetails.css";

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchService() {
      try {
        const res = await api.get(`/services/${id}`);
        setService(res.data);
      } catch (err) {
        setError("Failed to load service details");
      } finally {
        setLoading(false);
      }
    }

    fetchService();
  }, [id]);

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="logo" onClick={() => navigate("/")}>
          Uptime Monitor
        </div>
      </header>

      {/* Content */}
      <main className="content">
        {loading && <p>Loading service details...</p>}
        {error && <p className="error">{error}</p>}

        {service && (
          <div className="details-card">
            <div className="title-row">
              <h2>{service.name}</h2>
              <span
                className={`status ${
                  service.state === "UP" ? "up" : "down"
                }`}
              >
                {service.state}
              </span>
            </div>

            <p className="url">{service.url}</p>

            <h3>Service Configuration</h3>

            <div className="details-grid">
              <Detail label="Check Interval">
                {service.checkInterval} seconds
              </Detail>

              <Detail label="Timeout">
                {service.timeout} seconds
              </Detail>

              <Detail label="Failure Threshold">
                {service.failureThreshold}
              </Detail>

              <Detail label="Success Threshold">
                {service.successThreshold}
              </Detail>

              <Detail label="Alert Email">
                {service.alertEmail || "—"}
              </Detail>

              <Detail label="Discord Webhook URL">
                {service.webhookUrl || "—"}
              </Detail>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Detail({ label, children }) {
  return (
    <div className="detail">
      <span className="label">{label}</span>
      <span className="value">{children}</span>
    </div>
  );
}
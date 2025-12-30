import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import "./ServiceAnalytics.css";

function getDateRange(type) {
  const now = new Date();
  const to = now.toISOString();

  let from;
  if (type === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    from = start.toISOString();
  } else if (type === "7d") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    from = d.toISOString();
  } else if (type === "30d") {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    from = d.toISOString();
  }

  return { from, to };
}

export default function ServiceAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [range, setRange] = useState("7d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (range !== "custom") {
      const r = getDateRange(range);
      setFrom(r.from);
      setTo(r.to);
    }
  }, [range]);

  useEffect(() => {
    if (!from || !to) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [analyticsRes, incidentsRes] = await Promise.all([
          api.get(`/api/services/${id}/analytics`, {
            params: { from, to },
          }),
          api.get(`/api/services/${id}/incidents`, {
            params: { from, to },
          }),
        ]);

        setAnalytics(analyticsRes.data);
        setIncidents(incidentsRes.data);
      } catch {
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [from, to, id]);

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="logo" onClick={() => navigate("/")}>
          Uptime Monitor
        </div>
      </header>

      <main className="content">
        <h2>Service Analytics</h2>
        <br />
        {/* Date Range */}
        <div className="range-bar">
          <div className="range-tabs">
            <button
              className={range === "today" ? "active" : ""}
              onClick={() => setRange("today")}
            >
              Today
            </button>
            <button
              className={range === "7d" ? "active" : ""}
              onClick={() => setRange("7d")}
            >
              7 Days
            </button>
            <button
              className={range === "30d" ? "active" : ""}
              onClick={() => setRange("30d")}
            >
              30 Days
            </button>
            <button
              className={range === "custom" ? "active" : ""}
              onClick={() => setRange("custom")}
            >
              Custom
            </button>
          </div>

          {range === "custom" && (
            <div className="custom-range">
              <input
                type="date"
                onChange={(e) =>
                  setFrom(new Date(e.target.value).toISOString())
                }
              />
              <input
                type="date"
                onChange={(e) =>
                  setTo(new Date(e.target.value).toISOString())
                }
              />
            </div>
          )}
        </div>

        {/* KPI Cards */}
        {analytics && (
          <div className="kpi-grid">
            <Kpi title="Uptime" value={`${analytics.uptime_percentage}%`} highlight />
            <Kpi title="Total Checks" value={analytics.total_checks} />
            <Kpi title="Successful Checks" value={analytics.successful_checks} />
            <Kpi title="Avg Latency" value={`${analytics.avg_latency_ms} ms`} />
          </div>
        )}

        {/* Incidents */}
        <div className="section">
          <h3>Incident History</h3>

          {incidents.length === 0 && (
            <div className="empty">No incidents in this period 🎉</div>
          )}

          <div className="timeline">
            {incidents.map((i) => (
              <div key={i.id} className="incident-card">
                <div className="dot" />

                <div className="incident-content">
                  <div className="incident-time">
                    <strong>Started:</strong>{" "}
                    {new Date(i.started_at).toLocaleString()}
                  </div>
                  <div className="incident-time">
                    <strong>Resolved:</strong>{" "}
                    {i.resolved_at
                      ? new Date(i.resolved_at).toLocaleString()
                      : "Ongoing"}
                  </div>
                  <div className="duration">
                    Downtime: {Math.round(i.duration_seconds / 60)} mins
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function Kpi({ title, value, highlight }) {
  return (
    <div className={`kpi ${highlight ? "highlight" : ""}`}>
      <span className="kpi-title">{title}</span>
      <span className="kpi-value">{value}</span>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import "./Home.css";

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await api.get("/services");
        setServices(res.data);
      } catch (err) {
        setError("Failed to load services");
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div
          className="logo"
          onClick={() => navigate("/")}
        >
          Uptime Monitor
        </div>

        <button
          className="create-btn"
          onClick={() => navigate("/service/new")}
        >
          + Create Service
        </button>
      </header>

      {/* Content */}
      <main className="content">
        {loading && <p>Loading services...</p>}
        {error && <p className="error">{error}</p>}

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-info">
                <h3>{service.name}</h3>
                <p className="url">{service.url}</p>

                <span
                  className={`status ${
                    service.state === "UP" ? "up" : "down"
                  }`}
                >
                  {service.state}
                </span>
              </div>

              <div className="service-actions">
                <Link to={`/service/${service.id}`} className="btn secondary">
                  Details
                </Link>

                <Link
                  to={`/service/${service.id}/analytics`}
                  className="btn primary"
                >
                  Analytics
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
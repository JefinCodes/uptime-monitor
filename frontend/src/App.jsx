import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateService from "./pages/CreateService";
import ServiceDetails from "./pages/ServiceDetails";
import ServiceAnalytics from "./pages/ServiceAnalytics";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/service/new" element={<CreateService />} />
        <Route path="/service/:id" element={<ServiceDetails />} />
        <Route path="/service/:id/analytics" element={<ServiceAnalytics />} />
      </Routes>
    </BrowserRouter>
  );
}
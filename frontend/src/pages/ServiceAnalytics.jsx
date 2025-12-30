import { useParams } from "react-router-dom";

export default function ServiceAnalytics() {
  const { id } = useParams();
  return <h2>Service Analytics – {id}</h2>;
}
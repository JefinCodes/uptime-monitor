import { useParams } from "react-router-dom";

export default function ServiceDetails() {
  const { id } = useParams();
  return <h2>Service Details – {id}</h2>;
}
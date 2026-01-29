import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const potholes = [
  { id: 1, pos: [28.6139, 77.209] },
  { id: 2, pos: [28.61, 77.23] },
];

export default function MapView() {
  return (
    <MapContainer center={[28.6139, 77.209]} zoom={12} className="h-[80vh] rounded-lg">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {potholes.map(p => (
        <Marker key={p.id} position={p.pos}>
          <Popup>Pothole detected</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

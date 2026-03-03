import React, { useState } from "react";
import { getCurrentLocation, reverseGeocode } from "../services/locationService";

export default function UseMyLocationButton({ onLocationCaptured }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);

  const handleUseLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const coords = await getCurrentLocation();
      const location = await reverseGeocode(coords.latitude, coords.longitude);

      setAddress(location.formatted);
      onLocationCaptured?.(location);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleUseLocation}
        disabled={loading}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-xl transition disabled:bg-gray-400"
      >
        {loading ? "Locating..." : "📍 Use My Location"}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {address && (
        <p className="text-gray-700 text-sm font-medium">
          ✅ Location: {address}
        </p>
      )}
    </div>
  );
}

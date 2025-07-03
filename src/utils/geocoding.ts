
// A utility for converting addresses to coordinates using OpenStreetMap's Nominatim API
export interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
  error?: string;
}

export const geocodeAddress = async (address: string): Promise<GeocodingResult> => {
  try {
    // Encode the address for URL
    const encodedAddress = encodeURIComponent(address);
    
    // Use Nominatim API (OpenStreetMap) for geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
      {
        headers: {
          // Add a user agent as per Nominatim usage policy
          'User-Agent': 'EventEase App',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding error: ${response.status}`);
    }

    const data = await response.json();

    // Check if we got any results
    if (!data || data.length === 0) {
      return {
        lat: 0,
        lon: 0,
        display_name: address,
        error: "Address not found. Please check and try again."
      };
    }

    // Return the first result
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      lat: 0,
      lon: 0,
      display_name: address,
      error: "Failed to geocode address. Please try again later."
    };
  }
};

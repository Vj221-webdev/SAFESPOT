// src/services/locationService.js

/**
 * Get user's current GPS coordinates
 */
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage = 'Could not get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred.';
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };
  
  /**
   * Convert coordinates to human-readable address using Google Geocoding API
   * NOTE: For production, you'll need a Google Maps API key
   */
  export const reverseGeocode = async (latitude, longitude) => {
    try {
      // Using OpenStreetMap's Nominatim API (free, no API key needed)
      // For production, use Google Maps Geocoding API for better accuracy
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
  
      const data = await response.json();
      
      // Format the address nicely
      const address = data.address;
      let formattedAddress = '';
  
      if (address.road || address.street) {
        formattedAddress += address.road || address.street;
      }
      
      if (address.house_number) {
        formattedAddress = address.house_number + ' ' + formattedAddress;
      }
  
      if (address.suburb || address.neighbourhood) {
        formattedAddress += (formattedAddress ? ', ' : '') + (address.suburb || address.neighbourhood);
      }
  
      if (address.city || address.town || address.village) {
        formattedAddress += (formattedAddress ? ', ' : '') + (address.city || address.town || address.village);
      }
  
      if (address.state) {
        formattedAddress += (formattedAddress ? ', ' : '') + address.state;
      }
  
      return {
        formatted: formattedAddress || data.display_name,
        full: data.display_name,
        coordinates: {
          latitude,
          longitude
        }
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      
      // Fallback: return coordinates as string
      return {
        formatted: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        full: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        coordinates: {
          latitude,
          longitude
        }
      };
    }
  };
  
  /**
   * Get current location and convert to address
   */
  export const getLocationWithAddress = async () => {
    try {
      const coords = await getCurrentLocation();
      const address = await reverseGeocode(coords.latitude, coords.longitude);
      
      return {
        ...address,
        accuracy: coords.accuracy
      };
    } catch (error) {
      throw error;
    }
  };
  
  /**
   * Check if geolocation is available
   */
  export const isGeolocationAvailable = () => {
    return 'geolocation' in navigator;
  };
  
  /**
   * Format coordinates for display
   */
  export const formatCoordinates = (latitude, longitude) => {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  };
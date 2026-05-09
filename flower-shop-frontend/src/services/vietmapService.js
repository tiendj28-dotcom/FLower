import axios from "axios";

const VIETMAP_API_KEY = import.meta.env.VITE_VIETMAP_API_KEY;
const BASE_URL = "https://maps.vietmap.vn/api";

const vietmapService = {
  /**
   * Geocode địa chỉ thành tọa độ [lat, lng]
   */
  geocode: async (address) => {
    if (!VIETMAP_API_KEY) return null;
    try {
      const response = await axios.get(`${BASE_URL}/geocode?api-version=1.1&apikey=${VIETMAP_API_KEY}&address=${encodeURIComponent(address)}`);
      const data = response.data;
      if (data && data.length > 0) {
        return {
          lat: data[0].lat,
          lng: data[0].lng,
          label: data[0].display_name || data[0].address
        };
      }
      return null;
    } catch (error) {
      console.error("Vietmap Geocode Error:", error);
      return null;
    }
  },

  /**
   * Tính khoảng cách giữa 2 điểm (đường bộ)
   */
  getDistance: async (origin, destination) => {
    if (!VIETMAP_API_KEY) return null;
    try {
      // origin, destination: {lat, lng}
      const url = `${BASE_URL}/route?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${origin.lat},${origin.lng}&point=${destination.lat},${destination.lng}`;
      const response = await axios.get(url);
      const data = response.data;
      
      if (data && data.paths && data.paths.length > 0) {
        return data.paths[0].distance; // Đơn vị: mét
      }
      return null;
    } catch (error) {
      console.error("Vietmap Route Error:", error);
      return null;
    }
  },

  /**
   * Autocomplete tìm kiếm địa chỉ
   */
  autocomplete: async (text, focusPoint = null, radius = null) => {
    if (!VIETMAP_API_KEY) return [];
    try {
      let url = `${BASE_URL}/autocomplete?api-version=1.1&apikey=${VIETMAP_API_KEY}&text=${encodeURIComponent(text)}`;
      
      if (focusPoint) {
        url += `&focus.point.lat=${focusPoint.lat}&focus.point.lon=${focusPoint.lng}`;
      }
      
      if (radius) {
        // radius in meters
        url += `&boundary.circle.radius=${radius}`;
      }

      const response = await axios.get(url);
      return response.data || [];
    } catch (error) {
      console.error("Vietmap Autocomplete Error:", error);
      return [];
    }
  }
};

export default vietmapService;

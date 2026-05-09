import { useState, useEffect, useMemo } from "react";
import { MapPin, Loader2, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import vietmapService from "@/services/vietmapService";
import { PROVINCES, DISTRICTS, getHaversineDistance } from "@/data/vietnamLocality";

/**
 * VietmapLocationSelector - Component chọn Tỉnh/Thành & Quận/Huyện có lọc bán kính 40km
 */
export default function VietmapLocationSelector({ 
  storeAddress, 
  value = "", 
  onChange, 
  error 
}) {
  const [provinceId, setProvinceId] = useState("30"); // Fix cứng Hải Dương
  const [districtId, setDistrictId] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  
  const [storePoint, setStorePoint] = useState(null);
  const [isGeocodingStore, setIsGeocodingStore] = useState(false);
  
  const [distance, setDistance] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // 1. Lấy tọa độ cửa hàng khi bắt đầu
  useEffect(() => {
    const getStoreCoords = async () => {
      // Ưu tiên lấy từ cài đặt hệ thống, nếu không có thì lấy địa chỉ người dùng yêu cầu
      const addressToGeocode = storeAddress || "THPT Đường An, Bình Giang, Hải Dương";
      
      setIsGeocodingStore(true);
      const coords = await vietmapService.geocode(addressToGeocode);
      if (coords) {
        setStorePoint(coords);
      } else {
        // Fallback tọa độ cụ thể của THPT Đường An, Hải Dương (20.9161, 106.1625)
        setStorePoint({ lat: 20.9161, lng: 106.1625 });
      }
      setIsGeocodingStore(false);
    };
    getStoreCoords();
  }, [storeAddress]);

  // 2. Lọc danh sách Quận/Huyện của Hải Dương nằm trong phạm vi ~40km (Haversine)
  const filteredDistricts = useMemo(() => {
    if (!storePoint) return [];
    
    // Chỉ lấy Quận/Huyện của Hải Dương (ID: 30)
    const allInProvince = DISTRICTS["30"] || [];
    return allInProvince.map(d => {
      const birdDistance = getHaversineDistance(storePoint, { lat: d.lat, lng: d.lng });
      return { ...d, birdDistance };
    }).filter(d => d.birdDistance <= 45); // Lọc lân cận 45km đường chim bay
  }, [storePoint]);

  // 3. Khi chọn Quận/Huyện, tính khoảng cách đường bộ chính xác qua Vietmap API
  useEffect(() => {
    const calculateRealDistance = async () => {
      if (!districtId || !storePoint) {
        setDistance(null);
        return;
      }

      const selectedDist = filteredDistricts.find(d => d.id === districtId);
      if (!selectedDist) return;

      setIsCalculating(true);
      const distMeters = await vietmapService.getDistance(storePoint, { lat: selectedDist.lat, lng: selectedDist.lng });
      if (distMeters !== null) {
        setDistance(distMeters / 1000);
      } else {
        setDistance(selectedDist.birdDistance); // Fallback
      }
      setIsCalculating(false);
    };

    calculateRealDistance();
  }, [districtId, storePoint, filteredDistricts]);

  // 4. Cập nhật kết quả ra ngoài
  useEffect(() => {
    if (districtId) {
      const dName = filteredDistricts.find(d => d.id === districtId)?.name || "";
      const fullAddr = `${detailAddress ? detailAddress + ", " : ""}${dName}, Tỉnh Hải Dương`;
      
      // Chỉ gửi ra ngoài nếu khoảng cách <= 40km
      if (distance !== null && distance <= 40) {
        onChange?.(fullAddr);
      } else {
        onChange?.(""); 
      }
    }
  }, [districtId, detailAddress, distance, filteredDistricts]);

  return (
    <div className="space-y-4 border rounded-2xl p-5 bg-white dark:bg-gray-900 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tỉnh/Thành phố (Fix cứng) */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tỉnh/Thành phố</label>
          <div className="flex items-center h-12 px-4 border border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 cursor-not-allowed">
            Tỉnh Hải Dương
          </div>
        </div>

        {/* Select Quận/Huyện */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quận/Huyện tại Hải Dương</label>
          <div className="relative">
            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full appearance-none border border-gray-200 dark:border-gray-700 rounded-xl h-12 px-4 pr-10 text-sm bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 transition-all"
            >
              <option value="">-- Chọn Quận/Huyện --</option>
              {filteredDistricts.map(d => (
                <option key={d.id} value={d.id}>{d.name} (~{d.birdDistance.toFixed(1)}km)</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Địa chỉ chi tiết */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Địa chỉ chi tiết (Số nhà, đường...)</label>
        <div className="relative">
          <input
            type="text"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            placeholder="Ví dụ: 123 Nguyễn Huệ"
            disabled={!districtId}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl h-12 px-11 text-sm bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 transition-all disabled:opacity-50"
          />
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
        </div>
      </div>

      {/* Thông báo khoảng cách */}
      {(isCalculating || distance !== null) && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
          isCalculating ? "bg-blue-50 border-blue-100 text-blue-800" : 
          distance <= 40 ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
        }`}>
          {isCalculating ? (
            <Loader2 className="w-5 h-5 animate-spin mt-0.5" />
          ) : distance <= 40 ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          )}
          
          <div className="flex-1">
            <p className="text-sm font-bold">
              {isCalculating ? "Đang tính toán lộ trình..." : 
               distance <= 40 ? "Khu vực giao hàng hợp lệ" : "Vượt quá phạm vi giao hàng"}
            </p>
            <p className="text-xs opacity-90 mt-0.5">
              {isCalculating ? "Hệ thống đang kiểm tra khoảng cách di chuyển từ cửa hàng đến địa chỉ này." : 
               `Khoảng cách đường bộ từ shop đến khu vực này là ~${distance.toFixed(1)}km. ${
                 distance <= 40 ? "Chúng tôi có thể giao hoa đến đây!" : "Chúng tôi chỉ nhận giao hoa trong bán kính 40km."
               }`}
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500 font-medium px-2">{error}</p>}
      
      {isGeocodingStore && (
        <div className="flex items-center gap-2 text-[10px] text-gray-500 italic">
          <Loader2 className="w-3 h-3 animate-spin" />
          Đang tải thông tin vị trí cửa hàng để tính khoảng cách...
        </div>
      )}
    </div>
  );
}

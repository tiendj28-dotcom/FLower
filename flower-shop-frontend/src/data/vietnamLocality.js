// Dữ liệu Tỉnh/Thành và Quận/Huyện kèm tọa độ trung tâm để tính toán phạm vi 40km
export const PROVINCES = [
  { id: "30", name: "Tỉnh Hải Dương", lat: 20.941, lng: 106.333 },
  { id: "33", name: "Tỉnh Hưng Yên", lat: 20.646, lng: 106.051 },
  { id: "27", name: "Tỉnh Bắc Ninh", lat: 21.186, lng: 106.076 },
  { id: "31", name: "Thành phố Hải Phòng", lat: 20.844, lng: 106.688 },
  { id: "34", name: "Tỉnh Thái Bình", lat: 20.446, lng: 106.336 },
  { id: "01", name: "Thành phố Hà Nội", lat: 21.028, lng: 105.834 },
  { id: "79", name: "Thành phố Hồ Chí Minh", lat: 10.776, lng: 106.700 },
];

export const DISTRICTS = {
  "30": [ // Hải Dương
    { id: "288", name: "Thành phố Hải Dương", lat: 20.939, lng: 106.326 },
    { id: "290", name: "Thành phố Chí Linh", lat: 21.135, lng: 106.393 },
    { id: "291", name: "Thị xã Kinh Môn", lat: 21.018, lng: 106.520 },
    { id: "292", name: "Huyện Nam Sách", lat: 21.002, lng: 106.336 },
    { id: "293", name: "Huyện Kim Thành", lat: 20.957, lng: 106.495 },
    { id: "294", name: "Huyện Thanh Hà", lat: 20.893, lng: 106.433 },
    { id: "295", name: "Huyện Cẩm Giàng", lat: 20.941, lng: 106.223 },
    { id: "296", name: "Huyện Bình Giang", lat: 20.899, lng: 106.166 },
    { id: "297", name: "Huyện Gia Lộc", lat: 20.880, lng: 106.311 },
    { id: "298", name: "Huyện Tứ Kỳ", lat: 20.831, lng: 106.401 },
    { id: "299", name: "Huyện Ninh Giang", lat: 20.751, lng: 106.346 },
    { id: "300", name: "Huyện Thanh Miện", lat: 20.785, lng: 106.205 }
  ],
  "33": [ // Hưng Yên
    { id: "323", name: "Thành phố Hưng Yên", lat: 20.654, lng: 106.052 },
    { id: "325", name: "Huyện Văn Lâm", lat: 20.985, lng: 106.060 },
    { id: "326", name: "Huyện Văn Giang", lat: 20.931, lng: 105.952 },
    { id: "327", name: "Huyện Yên Mỹ", lat: 20.887, lng: 106.027 },
    { id: "328", name: "Thị xã Mỹ Hào", lat: 20.916, lng: 106.088 },
    { id: "329", name: "Huyện Ân Thi", lat: 20.809, lng: 106.082 },
    { id: "330", name: "Huyện Khoái Châu", lat: 20.814, lng: 105.968 },
    { id: "331", name: "Huyện Kim Động", lat: 20.738, lng: 106.035 },
    { id: "332", name: "Huyện Tiên Lữ", lat: 20.686, lng: 106.126 },
    { id: "333", name: "Huyện Phù Cừ", lat: 20.710, lng: 106.194 }
  ],
  "27": [ // Bắc Ninh
    { id: "256", name: "Thành phố Bắc Ninh", lat: 21.185, lng: 106.071 },
    { id: "258", name: "Thành phố Từ Sơn", lat: 21.116, lng: 105.992 },
    { id: "259", name: "Huyện Yên Phong", lat: 21.218, lng: 105.978 },
    { id: "260", name: "Huyện Quế Võ", lat: 21.157, lng: 106.185 },
    { id: "261", name: "Huyện Tiên Du", lat: 21.132, lng: 106.059 },
    { id: "262", name: "Huyện Thuận Thành", lat: 21.057, lng: 106.052 },
    { id: "263", name: "Huyện Gia Bình", lat: 21.082, lng: 106.166 },
    { id: "264", name: "Huyện Lương Tài", lat: 21.026, lng: 106.184 }
  ],
  "31": [ // Hải Phòng
    { id: "303", name: "Quận Hồng Bàng", lat: 20.865, lng: 106.666 },
    { id: "304", name: "Quận Ngô Quyền", lat: 20.852, lng: 106.697 },
    { id: "305", name: "Quận Lê Chân", lat: 20.834, lng: 106.671 },
    { id: "306", name: "Quận Hải An", lat: 20.835, lng: 106.732 },
    { id: "307", name: "Quận Kiến An", lat: 20.812, lng: 106.627 },
    { id: "308", name: "Quận Đồ Sơn", lat: 20.717, lng: 106.776 },
    { id: "309", name: "Quận Dương Kinh", lat: 20.781, lng: 106.704 },
    { id: "311", name: "Huyện Thuỷ Nguyên", lat: 20.938, lng: 106.671 },
    { id: "312", name: "Huyện An Dương", lat: 20.875, lng: 106.602 },
    { id: "313", name: "Huyện An Lão", lat: 20.814, lng: 106.541 },
    { id: "314", name: "Huyện Kiến Thuỵ", lat: 20.760, lng: 106.657 },
    { id: "315", name: "Huyện Tiên Lãng", lat: 20.713, lng: 106.551 },
    { id: "316", name: "Huyện Vĩnh Bảo", lat: 20.672, lng: 106.463 }
  ],
  "01": [ // Hà Nội (Một số quận phía Đông gần Hải Dương)
    { id: "004", name: "Quận Gia Lâm", lat: 21.018, lng: 105.938 },
    { id: "003", name: "Quận Long Biên", lat: 21.036, lng: 105.897 }
  ],
  "79": [ // TP.HCM (Giữ lại để test)
    { id: "760", name: "Quận 1", lat: 10.775, lng: 106.698 }
  ]
};

// Hàm tính khoảng cách chim bay (Haversine)
export function getHaversineDistance(pt1, pt2) {
  if (!pt1 || !pt2) return 999;
  const R = 6371; // km
  const dLat = (pt2.lat - pt1.lat) * Math.PI / 180;
  const dLon = (pt2.lng - pt1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(pt1.lat * Math.PI / 180) * Math.cos(pt2.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

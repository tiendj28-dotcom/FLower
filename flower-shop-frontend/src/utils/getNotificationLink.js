import { NOTIFICATION_ROUTES } from "@/constants/notificationRoutes";

export function getNotificationLink(item) {
  // Ưu tiên map theo type
  if (item?.type && NOTIFICATION_ROUTES[item.type]) {
    return NOTIFICATION_ROUTES[item.type];
  }

  // fallback dùng link từ DB nếu có
  if (item?.link) {
    if (item.link.startsWith("/staff/delivery") || item.link.startsWith("/staff/takeaway")) {
      return "/staff/orders";
    }
    return item.link;
  }

  return "/admin";
}

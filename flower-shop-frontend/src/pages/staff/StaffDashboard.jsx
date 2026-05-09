import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  ShoppingBag,
  ChefHat,
  Users,
  Clock,
  Calendar,
  ClipboardList,
  AlertCircle,
  TrendingUp,
  Package,
  User,
} from "lucide-react";
import authenticationService from "@/services/authenticationService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function StaffDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    authenticationService
      .getProfile()
      .then((res) => {
        const userData = res?.data?.id
          ? res.data
          : res?.data?.data || res?.data;
        setUser(userData);
      })
      .catch(console.error);
  }, []);

  const stats = [
    {
      title: "Đơn Takeaway",
      description: "Chờ xử lý",
      value: "N/A",
      icon: ShoppingBag,
      color: "text-amber-600",
      bg: "bg-amber-100/50",
      link: "/staff/takeaway",
    },
    {
      title: "Đơn Giao hàng",
      description: "Đang chờ giao",
      value: "N/A",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100/50",
      link: "/staff/orders",
    },
  
    {
      title: "Trạng thái  của bạn",
      description: "Hôm nay",
      value: "Sẵn sàng",
      icon: Clock,
      color: "text-green-600",
      bg: "bg-green-100/50",
      link: "/staff/attendance",
    },
  ];



  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Chào mừng trở lại, {user?.last_name || user?.first_name || "Trưởng ca"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Dưới đây là tổng quan tình trạng hoạt động của cửa hàng lúc này.
          </p>
        </div>
       
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} to={stat.link}>
              <Card className="p-6 transition-all hover:shadow-md hover:border-primary/50 cursor-pointer h-full border-border/60">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <Card className="p-0 overflow-hidden border-border/60">
          <div className="p-4 border-b bg-muted/20">
            <h3 className="font-semibold text-sm">Tin nhắn & Yêu cầu nội bộ</h3>
          </div>
          <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground/30 mb-3" />
            Không có yêu cầu nào đang chờ xử lý.
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => navigate("/staff/requests")}
            >
              Xem tất cả
            </Button>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden border-border/60 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="p-6 flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Thông tin cá nhân</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-[80%]">
              Xem và cập nhật thông tin cá nhân, thay đổi mật khẩu của bạn tại đây.
            </p>
            <Button onClick={() => navigate("/staff/profile")}>
              Xem hồ sơ
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

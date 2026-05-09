import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const predefinedReasons = [
  "Thay đổi ý định mua",
  "Đặt nhầm sản phẩm",
  "Thời gian giao hàng quá lâu",
  "Tìm thấy giá tốt hơn ở nơi khác",
  "Lý do khác",
];

export default function CancelOrderModal({ open, onClose, onConfirm, loading }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const handleConfirm = () => {
    let finalReason = selectedReason;
    if (selectedReason === "Lý do khác") {
      finalReason = otherReason.trim();
    }
    onConfirm(finalReason);
  };

  const isConfirmDisabled =
    !selectedReason || (selectedReason === "Lý do khác" && !otherReason.trim());

  // Reset state when opened
  const handleOpenChange = (isOpen) => {
    if (isOpen) {
      setSelectedReason("");
      setOtherReason("");
    }
    onClose(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hủy đơn hàng</DialogTitle>
          <DialogDescription>
            Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-3">
            {predefinedReasons.map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-colors"
              >
                <input
                  type="radio"
                  name="cancel_reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {reason}
                </span>
              </label>
            ))}
          </div>

          {selectedReason === "Lý do khác" && (
            <div className="mt-2 pl-7">
              <Textarea
                placeholder="Nhập lý do của bạn..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className="w-full text-sm"
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)} disabled={loading}>
            Đóng
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirmDisabled || loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang hủy...
              </>
            ) : (
              "Xác nhận hủy"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

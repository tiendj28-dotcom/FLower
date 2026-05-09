import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import toppingService from '../../../../services/toppingService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

export default function UpdateTopping({ open, onClose, onSuccess, topping }) {
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (topping) {
      setPrice(topping.price || '');
    }
  }, [topping]);

  const handleSubmit = async () => {
    if (!price) {
      toast.error('Vui lòng nhập giá topping');
      return;
    }

    if (Number(price) <= 0) {
      toast.error('Giá topping phải lớn hơn 0');
      return;
    }

    setSubmitting(true);
    try {
      await toppingService.update(topping.id, { price: Number(price) });
      toast.success('Cập nhật topping thành công');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error('Cập nhật topping thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật topping</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input value={topping?.name || ''} disabled />
          <Input placeholder="Giá topping" type="number" value={price} onChange={e => setPrice(e.target.value)} />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={submitting}>Hủy</Button>
            <Button onClick={handleSubmit} loading={submitting}>Cập nhật</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import productService from '../../../../services/productService';
import categoryService from '../../../../services/categoryService';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';

import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import RichTextEditor from "../../../../components/RichTextEditor/RichTextEditor";

export default function CreateProduct({ open, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('available');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ================================
  // FORMAT TIỀN
  // ================================
  const formatCurrency = (value) => {
    if (!value) return "";
    const num = Number(value);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // ================================
  // LOAD CATEGORY
  // ================================
  useEffect(() => {
    if (!open) return;

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await categoryService.getAll();
        setCategories(res.data.filter(c => c.is_deleted === 0));
      } catch {
        toast.error("Không thể tải danh mục");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [open]);

  // ================================
  // IMAGE
  // ================================
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 3) {
      toast.error("Tối đa 3 ảnh");
      return;
    }

    setImages((prev) => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ================================
  // RESET
  // ================================
  const resetForm = () => {
    setName('');
    setCategoryId('');
    setStatus('available');
    setDescription('');
    setPrice('');
    setImages([]);
    setPreviews([]);
  };

  // ================================
  // SUBMIT
  // ================================
  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Nhập tên sản phẩm");
    if (!categoryId) return toast.error("Chọn danh mục");
    if (!price || Number(price) <= 0) return toast.error("Giá không hợp lệ");

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("category_id", categoryId);
      formData.append("status", status);
      formData.append("description", description);
      formData.append("price", Number(price));

      images.forEach(img => formData.append("images", img));

      await productService.create(formData);

      toast.success("Tạo sản phẩm thành công");
      onSuccess?.();
      resetForm();
    } catch (err) {
      toast.error("Tạo sản phẩm thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl w-[99vw] max-h-[96vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* NAME */}
          <Input
            placeholder="Tên sản phẩm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* CATEGORY */}
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* PRICE */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              <span className="text-red-500">*</span> Giá
            </label>

            <div className="relative">
              <Input
                type="text"
                value={formatCurrency(price)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setPrice(raw);
                }}
                placeholder="Nhập giá"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                đ
              </span>
            </div>
          </div>

          {/* IMAGE */}
          <Input type="file" multiple onChange={handleImageChange} />

          {/* PREVIEW */}
          <div className="flex gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} className="w-20 h-20 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* DESCRIPTION */}
          <RichTextEditor value={description} onChange={setDescription} />

          {/* BUTTON */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? "Đang tạo..." : "Tạo sản phẩm"}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
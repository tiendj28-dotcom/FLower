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
import { Textarea } from '../../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

export default function UpdateProduct({ open, onClose, onSuccess, product }) {
  const productId = product?.id;

  // ===== FORM STATE =====
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('available');
  const [price, setPrice] = useState('');

  // ===== IMAGES =====
  const [oldImages, setOldImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState([]);

  // ===== CATEGORIES =====
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // ===== LOADING =====
  const [submitting, setSubmitting] = useState(false);

  // ===== LOAD CATEGORIES =====
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await categoryService.getAll();
        const active = res.data.filter((c) => c.is_deleted === 0);
        setCategories(active);
      } catch (err) {
        console.error('Load categories error:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  // ===== FILL FORM =====
  useEffect(() => {
    if (open && product) {
      setName(product.name || '');
      setCategoryId(String(product.category_id) || '');
      setDescription(product.description || '');
      setStatus(product.status || 'available');
      setPrice(product?.sizes?.[0]?.price || '');
      setOldImages(product.images || []);

      setDeleteImageIds([]);
      setNewImages([]);
    }
  }, [open, product]);

  // ===== IMAGE HANDLING =====
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalAfterAdd = oldImages.length + newImages.length + files.length;

    if (totalAfterAdd > 3) {
      toast.error('Tổng số ảnh không được vượt quá 3');
      return;
    }

    setNewImages((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index, imageId) => {
    if (imageId) {
      setDeleteImageIds((prev) => [...prev, imageId]);
      setOldImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.info('Ảnh sẽ được xóa khi lưu');
    } else {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }

    if (!categoryId) {
      toast.error('Vui lòng chọn danh mục');
      return;
    }

    if (!price || Number(price) <= 0) {
      toast.error('Giá không hợp lệ');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('category_id', categoryId);
      formData.append('description', description.trim());
      formData.append('status', status);
      formData.append('sizes', JSON.stringify([{ size: 'M', price: Number(price) }]));

      if (deleteImageIds.length > 0) {
        formData.append('deleteImageIds', JSON.stringify(deleteImageIds));
      }

      newImages.forEach((file) => {
        formData.append('images', file);
      });

      await productService.update(productId, formData);

      toast.success('Cập nhật sản phẩm thành công');
      onSuccess?.();
      onClose();
    } catch (err) {
      const res = err.response?.data;

      if (res?.errors && Array.isArray(res.errors)) {
        res.errors.forEach((e) => toast.error(e.message));
      } else if (res?.message) {
        toast.error(res.message);
      } else {
        toast.error('Cập nhật sản phẩm thất bại');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ===== IMAGE PREVIEW =====
  const getAllImagesForPreview = () => {
    const oldImagePreviews = oldImages.map((img) => ({
      id: img.id,
      url: img.image_url,
      isThumbnail: img.isThumbnail === 1,
      isOld: true,
    }));

    const newImagePreviews = newImages.map((file, index) => ({
      id: null,
      url: URL.createObjectURL(file),
      isThumbnail: false,
      isOld: false,
      index,
    }));

    return [...oldImagePreviews, ...newImagePreviews];
  };

  const imagePreviews = getAllImagesForPreview();

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className='sm:max-w-2xl w-[99vw] max-w-[99vw] max-h-[96vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* NAME */}
          <div className='space-y-2'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                <span className='text-red-500'>*</span> Tên sản phẩm
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='VD: hoa tươi sữa đá'
              />
            </div>
          </div>

          {/* CATEGORY + STATUS */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                <span className='text-red-500'>*</span> Danh mục
              </label>
              <Select
                value={String(categoryId)}
                onValueChange={setCategoryId}
                disabled={loadingCategories}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Chọn danh mục' />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                <span className='text-red-500'>*</span> Trạng thái
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='available'>Đang bán</SelectItem>
                  <SelectItem value='unavailable'>Ngừng bán</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* PRICE */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              <span className='text-red-500'>*</span> Giá
            </label>
            <Input
              type='number'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder='Nhập giá sản phẩm'
              min={1}
            />
          </div>

          {/* DESCRIPTION */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Mô tả</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Mô tả sản phẩm'
            />
          </div>

          {/* IMAGES */}
          <div className='space-y-3'>
            <label className='text-sm font-medium'>
              Hình ảnh{' '}
              <span className='text-muted-foreground'>
                ({imagePreviews.length}/3)
              </span>
            </label>

            <Input
              type='file'
              multiple
              accept='image/*'
              onChange={handleImageChange}
              disabled={imagePreviews.length >= 3}
            />

            {imagePreviews.length >= 3 && (
              <p className='text-xs text-amber-600'>Đã đạt giới hạn 3 ảnh</p>
            )}

            {imagePreviews.length > 0 && (
              <div className='grid grid-cols-5 gap-3'>
                {imagePreviews.map((img, index) => (
                  <div key={index} className='relative group'>
                    <img
                      src={img.url}
                      alt=''
                      className='w-full h-24 object-cover rounded-lg border'
                    />

                    {img.isThumbnail && (
                      <span className='absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded'>
                        Thumbnail
                      </span>
                    )}

                    <button
                      type='button'
                      onClick={() => handleRemoveImage(img.index, img.id)}
                      className='absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition'
                    >
                      X
                    </button>

                    {!img.isOld && (
                      <span className='absolute bottom-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded'>
                        Mới
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTION */}
          <div className='flex justify-end gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </Button>

            <Button type='submit' disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
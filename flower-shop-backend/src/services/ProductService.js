const ProductRepository = require('../repositories/ProductRepository');
const ProductSizeRepository = require('../repositories/ProductSizeRepository');
const ProductImageRepository = require('../repositories/ProductImageRepository');
const CategoryRepository = require('../repositories/CategoryRepository');
const cloudinary = require('../config/cloudinary');
const ErrorResponse = require('../utils/ErrorResponse');

class ProductService {
  async generateUniqueProductCode() {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const randomNumber = Math.floor(10000 + Math.random() * 90000);
      const candidate = `PRD-${randomNumber}`;
      const existing = await ProductRepository.findByCode(candidate);
      if (!existing) {
        return candidate;
      }
    }

    throw new ErrorResponse(500, 'Không thể tự tạo mã code sản phẩm');
  }

  extractPublicId(url) {
    try {
      const matches = url.match(/\/products\/([^/.]+)/);
      return matches ? `products/${matches[1]}` : null;
    } catch (error) {
      return null;
    }
  }

  async getAllProducts(options = {}) {
    const { status, category_id, sort, ...rest } = options;
    const conditions = {};

    if (status) {
      conditions.status = status;
    }

    if (category_id) {
      conditions.category_id = category_id;
    }

    return ProductRepository.findAllWithDetails(conditions, {
      ...rest,
      sort,
    });
  }

  async getProductById(id) {
    const product = await ProductRepository.findByIdWithDetails(id);
    if (!product) {
      throw new ErrorResponse(404, 'Product không tồn tại');
    }
    return product;
  }

  async getProductsByCategory(categoryId, options = {}) {
    const category = await CategoryRepository.findById(categoryId);
    if (!category || category.is_deleted === 1) {
      throw new ErrorResponse(404, 'Category không tồn tại');
    }

    return ProductRepository.findByCategory(categoryId, options);
  }

  /**
   * Create new product
   * CHỈ TẠO: name, code ,category_id, status, description, images
   */
  async createProduct(data) {
    // Validate category exists
    const category = await CategoryRepository.findById(data.category_id);
    if (!category || category.is_deleted === 1) {
      throw new ErrorResponse(404, 'Category không tồn tại');
    }

    // Check if product name already exists
    const existingNameProduct = await ProductRepository.findByName(data.name);
    if (existingNameProduct) {
      throw new ErrorResponse(409, 'Tên sản phẩm đã tồn tại');
    }

    const normalizedCode = data.code?.trim().toUpperCase();
    let finalCode = normalizedCode;

    if (!finalCode) {
      finalCode = await this.generateUniqueProductCode();
    } else {
      const existingCodeProduct = await ProductRepository.findByCode(finalCode);
      if (existingCodeProduct) {
        throw new ErrorResponse(409, 'Mã code sản phẩm đã tồn tại');
      }
    }

    // Validate images
    if (data.images && data.images.length > 3) {
      throw new ErrorResponse(400, 'Tối đa chỉ được upload 3 ảnh');
    }

    // Create product (KHÔNG có sizes)
    const product = await ProductRepository.create({
      name: data.name.trim(),
      code: finalCode,
      category_id: data.category_id,
      status: data.status || 'available',
      description: data.description || null,
    });
    if (data.price !== undefined && data.price !== null && data.price !== '') {
      const price = Number(data.price);
      if (Number.isFinite(price) && price > 0) {
        await ProductSizeRepository.upsert(product.id, 'M', price);
      }
    }

    // Create product images
    // ẢNH ĐẦU TIÊN LÀ THUMBNAIL
    if (data.images && Array.isArray(data.images)) {
      for (let i = 0; i < data.images.length; i++) {
        await ProductImageRepository.create({
          product_id: product.id,
          image_url: data.images[i].url,
          isThumbnail: i === 0 ? 1 : 0,
        });
      }
    }

    return this.getProductById(product.id);
  }

  /**
   * Update product
   * CÓ THỂ: name, category_id, status, description, sizes, images
   */
  async updateProduct(id, data) {
    // Check if product exists
    const existingProduct = await ProductRepository.findById(id);
    if (!existingProduct) {
      throw new ErrorResponse(404, 'Product không tồn tại');
    }

    // Prepare update data for product table
    const updateData = {};

    if (data.name !== undefined) {
      const duplicateProduct = await ProductRepository.findByName(
        data.name.trim(),
      );
      if (duplicateProduct && duplicateProduct.id !== parseInt(id)) {
        throw new ErrorResponse(409, 'Tên sản phẩm đã tồn tại');
      }
      updateData.name = data.name.trim();
    }

    if (data.category_id !== undefined) {
      const category = await CategoryRepository.findById(data.category_id);
      if (!category || category.is_deleted === 1) {
        throw new ErrorResponse(404, 'Category không tồn tại');
      }
      updateData.category_id = data.category_id;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (Object.keys(updateData).length > 0) {
      await ProductRepository.update(id, updateData);
    }

    if (data.sizes && Array.isArray(data.sizes)) {
      const normalizedSizes = data.sizes.map((sizeItem) => {
        const normalizedSize = String(sizeItem.size || 'M').trim().toUpperCase();
        const normalizedPrice = Number(sizeItem.price);

        if (!normalizedSize) {
          throw new ErrorResponse(400, 'Size không hợp lệ');
        }

        if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
          throw new ErrorResponse(400, `Giá cho size ${normalizedSize} phải là số dương`);
        }

        return {
          size: normalizedSize,
          price: normalizedPrice,
        };
      });

      const incomingSizes = normalizedSizes.map((s) => s.size);
      const uniqueSizes = [...new Set(incomingSizes)];
      if (incomingSizes.length !== uniqueSizes.length) {
        throw new ErrorResponse(400, 'Không được có size trùng lặp');
      }

      if (normalizedSizes.length > 3) {
        throw new ErrorResponse(400, 'Tối đa chỉ có 3 mức giá');
      }

      await ProductSizeRepository.softDeleteNotIn(id, incomingSizes);

      for (const sizeItem of normalizedSizes) {
        await ProductSizeRepository.upsert(id, sizeItem.size, sizeItem.price);
      }
    }

    let thumbnailDeleted = false;

    if (data.deleteImageIds && Array.isArray(data.deleteImageIds)) {
      for (const imageId of data.deleteImageIds) {
        const image = await ProductImageRepository.findById(imageId);
        if (!image) continue;

        if (image.isThumbnail === 1) {
          thumbnailDeleted = true;
        }

        await ProductImageRepository.softDelete(imageId);

        const publicId = this.extractPublicId(image.image_url);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error('Failed to delete from Cloudinary:', err);
          }
        }
      }
    }

    const remainingImages = await ProductImageRepository.findByProductId(id);

    if (data.newImages && Array.isArray(data.newImages)) {
      const shouldSetFirstAsThumbnail = remainingImages.length === 0;

      for (let i = 0; i < data.newImages.length; i++) {
        await ProductImageRepository.create({
          product_id: id,
          image_url: data.newImages[i].url,
          isThumbnail: shouldSetFirstAsThumbnail && i === 0 ? 1 : 0,
        });
      }
    }

    if (thumbnailDeleted && remainingImages.length > 0) {
      const firstRemainingImage = remainingImages.sort(
        (a, b) => a.id - b.id,
      )[0];
      await ProductImageRepository.setThumbnail(id, firstRemainingImage.id);
    }

    return this.getProductById(id);
  }

  async deleteProduct(id) {
    await this.getProductById(id);

    const deleted = await ProductRepository.softDelete(id);

    if (!deleted) {
      throw new ErrorResponse(500, 'Xóa product thất bại');
    }

    return true;
  }

  async searchProducts(keyword, options = {}) {
    if (!keyword || keyword.trim() === '') {
      return this.getAllProducts(options);
    }

    return ProductRepository.search(keyword.trim(), options);
  }

  async countProducts(filters = {}) {
    const conditions = {};

    if (filters.status) conditions.status = filters.status;
    if (filters.category_id) conditions.category_id = filters.category_id;

    return ProductRepository.countAll(conditions, filters);
  }

  async countProductsByCategory(categoryId, options = {}) {
    return ProductRepository.countByCategory(
      categoryId,
      options
    );
  }

  async countSearchResults(keyword, options = {}) {
    if (!keyword || keyword.trim() === '') {
      return this.countProducts({
        status: options.status,
        category_id: options.category_id,
        min_price: options.min_price,
        max_price: options.max_price,
        size: options.size,
      });
    }

    return ProductRepository.countSearch(keyword.trim(), options);
  }

  async restoreProduct(id) {
    const product = await ProductRepository.findById(id);

    if (!product) {
      throw new ErrorResponse(404, 'Product không tồn tại');
    }

    if (product.status === 'available') {
      throw new ErrorResponse(400, 'Product chưa bị xóa');
    }

    if (Number(product.is_deleted) === 0) {
      throw new ErrorResponse(400, 'Product chưa bị xóa');
    }

    await ProductRepository.update(id, { is_deleted: 0 });

    return this.getProductById(id);
  }

  async getBestSellerProducts(limit = 8) {
    return ProductRepository.findBestSellers(limit);
  }
}

module.exports = new ProductService();

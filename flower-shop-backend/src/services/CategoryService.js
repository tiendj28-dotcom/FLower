const CategoryRepository = require("../repositories/CategoryRepository");
const ErrorResponse = require("../utils/ErrorResponse");

class CategoryService {
  normalizeCodePrefix(name = '') {
    const normalized = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .trim();

    const words = normalized.split(/\s+/).filter(Boolean);
    if (!words.length) return 'CAT';

    // Use initials for readable short code prefix.
    const initials = words.map((word) => word[0]).join('');
    return initials.toUpperCase().slice(0, 5) || 'CAT';
  }

  async generateUniqueCode(name = '') {
    const prefix = this.normalizeCodePrefix(name);

    for (let attempt = 0; attempt < 50; attempt += 1) {
      const value = Math.floor(Math.random() * 100000);
      const suffix = String(value).padStart(5, '0');
      const code = `${prefix}-${suffix}`;
      const existingCode = await CategoryRepository.findByCode(code);
      if (!existingCode) {
        return code;
      }
    }

    throw new ErrorResponse(500, 'Không thể tạo mã danh mục tự động');
  }

  /**
   * Get all categories
   */
  async getAllCategories(options = {}) {
    return CategoryRepository.findAllActive(options);
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id) {
    const category = await CategoryRepository.findById(id);

    if (!category) {
      throw new ErrorResponse(404, "Category không tồn tại");
    }

    if (category.is_deleted === 1) {
      throw new ErrorResponse(404, "Category đã bị xóa");
    }

    return category;
  }

  /**
   * Create new category
   */
  async createCategory(data) {
    const existingName = await CategoryRepository.findByName(data.name);
    if (existingName) {
      throw new ErrorResponse(409, 'Tên category đã tồn tại');
    }

    const trimmedName = data.name.trim();
    const providedCode = data.code?.trim().toUpperCase();
    let finalCode = providedCode;

    if (providedCode) {
      const existingCode = await CategoryRepository.findByCode(providedCode);
      if (existingCode) {
        throw new ErrorResponse(409, 'Mã code category đã tồn tại');
      }
    } else {
      finalCode = await this.generateUniqueCode(trimmedName);
    }

    return CategoryRepository.create({
      name: trimmedName,
      code: finalCode,
      image_url: data.image_url || null,
    });
  }

  /**
   * Update category
   */
  async updateCategory(id, data) {
    const category = await this.getCategoryById(id);

    const updateData = {};

    // If updating name, check if new name already exists
    if (data.name && data.name !== category.name) {
      const existingCategory = await CategoryRepository.findByName(data.name);
      if (existingCategory && existingCategory.id !== parseInt(id)) {
        throw new ErrorResponse(409, 'Tên danh mục đã tồn tại');
      }
      updateData.name = data.name.trim();
    }

    // check category code if exist
    if (data.code && data.code !== category.code) {
      const existingCode = await CategoryRepository.findByCode(data.code);
      if (existingCode && existingCode.id !== parseInt(id)) {
        throw new ErrorResponse(409, 'Mã Code danh mục đã tồn tại');
      }
      updateData.code = data.code.trim().toUpperCase();
    }

    if (data.image_url !== undefined) {
      updateData.image_url = data.image_url;
    }

    return CategoryRepository.update(id, updateData);
  }

  /**
   * Delete category (soft delete)
   */
  async deleteCategory(id) {
    // Check if category exists
    await this.getCategoryById(id);

    // Check if category has products
    const hasProducts = await CategoryRepository.hasProducts(id);
    if (hasProducts) {
      throw new ErrorResponse(400, 'Không thể xóa danh mục vì có sản phẩm đang sử dụng');
    }

    // Soft delete
    const deleted = await CategoryRepository.softDelete(id);

    if (!deleted) {
      throw new ErrorResponse(500, "Xóa danh mục thất bại");
    }

    return true;
  }
}

module.exports = new CategoryService();

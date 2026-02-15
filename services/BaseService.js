/**
 * BaseService - A reusable base class for all service modules
 * Provides standard CRUD operations with built-in error handling
 */
class BaseService {
  constructor(model) {
    this.model = model;
  }

  /**
   * Async error handler wrapper
   * @param {Function} fn - Async function to wrap
   * @returns {Promise} - Wrapped promise with error handling
   */
  async handleAsync(fn) {
    try {
      return await fn();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Format and standardize errors
   * @param {Error} error - Original error
   * @returns {Error} - Formatted error
   */
  handleError(error) {
    // Add more specific error handling as needed
    if (error.name === 'ValidationError') {
      error.statusCode = 400;
    } else if (error.name === 'CastError') {
      error.statusCode = 400;
      error.message = 'Invalid ID format';
    } else if (error.code === 11000) {
      error.statusCode = 409;
      error.message = 'Duplicate entry detected';
    } else if (!error.statusCode) {
      error.statusCode = 500;
    }
    return error;
  }

  /**
   * Create a new document
   * @param {Object} data - Data for the new document
   * @returns {Promise<Object>} - Created document
   */
  async create(data) {
    return this.handleAsync(async () => {
      const document = new this.model(data);
      return await document.save();
    });
  }

  /**
   * Find document by ID
   * @param {String} id - Document ID
   * @param {Object} options - Query options (populate, select)
   * @returns {Promise<Object|null>} - Found document or null
   */
  async findById(id, options = {}) {
    return this.handleAsync(async () => {
      let query = this.model.findById(id);
      
      if (options.populate) {
        query = query.populate(options.populate);
      }
      if (options.select) {
        query = query.select(options.select);
      }
      
      return await query.exec();
    });
  }

  /**
   * Find all documents with optional filtering
   * @param {Object} filter - Query filter
   * @param {Object} options - Query options (sort, limit, skip, populate, select)
   * @returns {Promise<Array>} - Array of documents
   */
  async findAll(filter = {}, options = {}) {
    return this.handleAsync(async () => {
      let query = this.model.find(filter);
      
      if (options.sort) {
        query = query.sort(options.sort);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.skip) {
        query = query.skip(options.skip);
      }
      if (options.populate) {
        query = query.populate(options.populate);
      }
      if (options.select) {
        query = query.select(options.select);
      }
      
      return await query.exec();
    });
  }

  /**
   * Find one document by filter
   * @param {Object} filter - Query filter
   * @param {Object} options - Query options (populate, select)
   * @returns {Promise<Object|null>} - Found document or null
   */
  async findOne(filter, options = {}) {
    return this.handleAsync(async () => {
      let query = this.model.findOne(filter);
      
      if (options.populate) {
        query = query.populate(options.populate);
      }
      if (options.select) {
        query = query.select(options.select);
      }
      
      return await query.exec();
    });
  }

  /**
   * Update document by ID
   * @param {String} id - Document ID
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} - Updated document
   */
  async update(id, data, options = { new: true, runValidators: true }) {
    return this.handleAsync(async () => {
      return await this.model.findByIdAndUpdate(id, data, options);
    });
  }

  /**
   * Delete document by ID
   * @param {String} id - Document ID
   * @returns {Promise<Object>} - Deleted document
   */
  async delete(id) {
    return this.handleAsync(async () => {
      return await this.model.findByIdAndDelete(id);
    });
  }

  /**
   * Count documents matching filter
   * @param {Object} filter - Query filter
   * @returns {Promise<Number>} - Count of documents
   */
  async count(filter = {}) {
    return this.handleAsync(async () => {
      return await this.model.countDocuments(filter);
    });
  }

  /**
   * Check if document exists
   * @param {Object} filter - Query filter
   * @returns {Promise<Boolean>} - True if exists, false otherwise
   */
  async exists(filter) {
    return this.handleAsync(async () => {
      const count = await this.model.countDocuments(filter);
      return count > 0;
    });
  }
}

module.exports = BaseService;

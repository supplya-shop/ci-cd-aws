const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");
const User = require("../models/User");
const Category = require("../models/Category");
// const userController = require("../controllers/user");
// const notificationService = require("../middleware/notification");
const { approveProductMail } = require("../middleware/mailUtil");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const cron = require("node-cron");

const validateProductData = (product) => {
  const {
    name,
    unit_price,
    description,
    quantity,
    category,
    createdBy,
    moq,
    flashsale,
    flashsaleStartDate,
    flashsaleEndDate,
  } = product;

  if (!name || typeof name !== "string") return "Invalid or missing name";
  if (isNaN(unit_price) || unit_price < 0)
    return "Invalid or missing unit_price";
  if (!description || typeof description !== "string")
    return "Invalid or missing description";
  if (isNaN(quantity) || quantity < 0) return "Invalid or missing quantity";
  if (!category || typeof category !== "string")
    return "Invalid or missing category";
  if (!createdBy || typeof createdBy !== "string")
    return "Invalid or missing createdBy";
  if (isNaN(moq) || moq < 1) return "Invalid or missing moq";

  if (flashsale) {
    if (!flashsaleStartDate) return "Missing flashsaleStartDate";
    if (!flashsaleEndDate) return "Missing flashsaleEndDate";

    const startDate = new Date(flashsaleStartDate);
    const endDate = new Date(flashsaleEndDate);

    if (isNaN(startDate)) return "Invalid flashsaleStartDate";
    if (isNaN(endDate)) return "Invalid flashsaleEndDate";
    if (startDate >= endDate)
      return "flashsaleStartDate must be before flashsaleEndDate";
  }

  return null;
};

const processProducts = (rows) => {
  const products = [];
  const errors = [];

  rows.forEach((row, index) => {
    const product = {
      name: row.name,
      unit_price: parseFloat(row.unit_price),
      discounted_price: parseFloat(row.discounted_price) || 0,
      description: row.description,
      quantity: parseInt(row.quantity, 10),
      category: row.category,
      image: row.image || "",
      images: row.images ? row.images.split(";") : [],
      brand: row.brand || "",
      createdBy: row.createdBy,
      status: row.status || "inStock",
      rating: row.rating || "",
      isFeatured: row.isFeatured === "true",
      flashsale: row.flashsale === "true",
      flashsaleStartDate: row.flashsaleStartDate
        ? parseDate(row.flashsaleStartDate)
        : null,
      flashsaleEndDate: row.flashsaleEndDate
        ? parseDate(row.flashsaleEndDate)
        : null,
      salesCount: parseInt(row.salesCount, 10) || 0,
      approved: row.approved === "true",
      dateCreated: row.dateCreated ? parseDate(row.dateCreated) : new Date(),
      dateModified: row.dateModified ? parseDate(row.dateModified) : null,
      sku: row.sku || "",
      moq: parseInt(row.moq, 10) || 1,
    };

    const error = validateProductData(product);
    if (error) {
      errors.push(`Row ${index + 1}: ${error}`);
    } else {
      products.push(product);
    }
  });

  return { products, errors };
};

const importProducts = async (req, res) => {
  const filePath = req.file.path;

  const parseDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date) ? null : date;
  };

  if (path.extname(filePath).toLowerCase() === ".csv") {
    const products = [];
    const errors = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const product = {
          name: row.name,
          unit_price: parseFloat(row.unit_price),
          discounted_price: parseFloat(row.discounted_price) || 0,
          description: row.description,
          quantity: parseInt(row.quantity, 10),
          category: row.category,
          image: row.image || "",
          images: row.images ? row.images.split(";") : [],
          brand: row.brand || "",
          createdBy: row.createdBy,
          status: row.status || "inStock",
          rating: row.rating || "",
          isFeatured: row.isFeatured === "true",
          flashsale: row.flashsale === "true",
          flashsaleStartDate: row.flashsaleStartDate
            ? parseDate(row.flashsaleStartDate)
            : null,
          flashsaleEndDate: row.flashsaleEndDate
            ? parseDate(row.flashsaleEndDate)
            : null,
          salesCount: parseInt(row.salesCount, 10) || 0,
          approved: row.approved === "true",
          dateCreated: row.dateCreated
            ? parseDate(row.dateCreated)
            : new Date(),
          dateModified: row.dateModified ? parseDate(row.dateModified) : null,
          sku: row.sku || "",
          moq: parseInt(row.moq, 10) || 1,
        };

        const error = validateProductData(product);
        if (error) {
          errors.push(`Row ${products.length + 1}: ${error}`);
        } else {
          products.push(product);
        }
      })
      .on("end", async () => {
        if (errors.length > 0) {
          res.status(StatusCodes.BAD_REQUEST).json({
            status: false,
            message: "Validation errors occurred",
            errors: errors,
          });
        } else {
          try {
            await Product.insertMany(products);
            res.status(StatusCodes.OK).json({
              status: true,
              message: "Products imported successfully",
            });
          } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
              status: false,
              message: "Failed to import products: " + error.message,
            });
          } finally {
            fs.unlinkSync(filePath);
          }
        }
      })
      .on("error", (error) => {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: false,
          message: "Failed to parse CSV file: " + error.message,
        });
      });
  } else if (path.extname(filePath).toLowerCase() === ".xlsx") {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);

      const { products, errors } = processProducts(rows);

      if (errors.length > 0) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: "Validation errors occurred",
          errors: errors,
        });
      } else {
        await Product.insertMany(products);
        res.status(StatusCodes.OK).json({
          status: true,
          message: "Products imported successfully",
        });
      }
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to import products: " + error.message,
      });
    } finally {
      fs.unlinkSync(filePath);
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: "Unsupported file format. Please upload a CSV or XLSX file.",
    });
  }
};

const createProduct = async (req, res, next) => {
  const userId = req.user.userid;
  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: "User not found",
    });
  }

  if (user.blocked) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: false,
      message:
        "Access denied. Account under review. Please contact support for further assistance.",
    });
  }

  if (!user.phoneNumber) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message:
        "Please ensure that you have provided your phone number in your profile then continue to create product.",
    });
  }

  const product = req.body;

  if (!product) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: "Please enter all required fields",
    });
  }

  if (product.flashsale) {
    if (!product.flashsaleStartDate || !product.flashsaleEndDate) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Flash sale start and end dates are required",
      });
    }

    const startDate = new Date(product.flashsaleStartDate);
    const endDate = new Date(product.flashsaleEndDate);

    if (endDate <= startDate) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Flash sale end date must be after the start date",
      });
    }
  }

  product.createdBy = userId;
  product.approved = true;
  const newProduct = new Product(product);

  try {
    await newProduct.save();
    return res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to create product: " + error.message,
    });
  }
};

const submitProduct = async (req, res, next) => {
  const userId = req.user.userid;
  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: "User not found",
    });
  }

  if (user.blocked) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: false,
      message:
        "Access denied. Account under review. Please contact support for further assistance.",
    });
  }

  const product = req.body;
  if (!product) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: false,
      message: "Please fill all required fields",
    });
  }

  product.createdBy = userId;
  product.approved = false;
  const newProduct = new Product(product);
  try {
    const vendor = await User.findById(userId).select(
      "firstName lastName email"
    );

    if (!vendor) {
      return res.status(StatusCodes.OK).json({
        message: "Vendor not found",
        status: false,
      });
    }
    await newProduct.save();
    // const adminId = await userController.getAdminUsers();
    // const message = `Vendor ${vendor.name} has submitted a new product: ${newProduct.name}`;
    // await notificationService.createNotification(adminId, message);
    await approveProductMail(
      `${vendor.firstName} ${vendor.lastName}`,
      req.body.name
    );
    return res.status(StatusCodes.CREATED).json({
      message: "Product successfully submitted for approval",
      status: true,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to create Product",
      status: false,
    });
  }
};

const duplicateProduct = async (req, res) => {
  const productId = req.params.productId;
  const { userid } = req.user;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "Product not found",
      });
    }

    const newProduct = new Product({
      name: `${product.name} (Copy)`,
      description: product.description,
      unit_price: product.unit_price,
      discounted_price: product.discounted_price,
      quantity: product.quantity,
      category: product.category,
      flashsale: product.flashale,
      approved: product.approved,
      brand: product.brand,
      rating: product.rating,
      moq: product.moq,
      sku: product.sku,
      image: product.image,
      images: product.images,
      createdBy: userid,
    });

    await newProduct.save();

    return res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Product duplicated successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error duplicating product:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to duplicate product. " + error.message,
    });
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find({})
      .populate({
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
      })
      .select(
        "name unit_price discounted_price description quantity category image images brand createdBy status rating numReviews isFeatured flashsale isTrending isDealOfTheDay saleCount dateCreated moq approved sku"
      )
      .populate("category", "name")
      .sort({ dateCreated: -1 })
      .limit(limit)
      .skip(startIndex);

    if (products.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No products found",
        data: products,
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Products fetched successfully",
      data: products,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProducts,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch products",
    });
  }
};

const getProductById = async (req, res, next) => {
  const productId = req.params.id;
  Product.findById(productId)
    .populate({
      path: "createdBy",
      select:
        "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
    })
    .select(
      "name unit_price discounted_price description quantity category image images brand status createdBy rating numReviews isFeatured flashsale isTrending isDealOfTheDay saleCount dateCreated moq approved sku"
    )
    .populate("category", "name")
    .then((product) => {
      if (!product) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: false,
          message: "No product found",
        });
      }
      return res.status(StatusCodes.OK).json({
        status: true,
        message: "Product fetched successfully",
        data: product,
      });
    })
    .catch((error) => {
      console.error(error.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch product",
      });
    });
};

const getRelatedProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;

    const totalProductsCount = await Product.countDocuments();
    const totalPages = Math.ceil(totalProductsCount / limit);
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No product found",
        data: currentProduct,
      });
    }

    const relatedProducts = await Product.find({
      category: currentProduct.category,
      _id: { $ne: productId },
    })
      .select("name unit_price discounted_price description image status")
      .populate({
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
      })
      .sort({ dateCreated: -1 })
      .limit(limit)
      .skip(startIndex);

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Products fetched successfully",
      data: relatedProducts,
      page: page,
      totalPages: totalPages,
      totalProducts: totalProductsCount,
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error", status: false });
  }
};

const getProductsByVendor = async (req, res) => {
  try {
    const vendorId = req.user.userid;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const startIndex = (page - 1) * limit;

    const totalProductsCount = await Product.countDocuments({
      createdBy: vendorId,
    });
    const totalPages = Math.ceil(totalProductsCount / limit);

    const products = await Product.find({ createdBy: vendorId })
      .select(
        "name unit_price discounted_price description quantity category image images brand createdBy status rating numReviews isFeatured flashsale isTrending isDealOfTheDay saleCount dateCreated moq approved sku"
      )
      .populate("category", "name")
      .populate({
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
      })
      .sort({ dateCreated: -1 })
      .limit(limit)
      .skip(startIndex);

    if (!products || products.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No products found",
        data: products,
      });
    }
    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Products fetched successfully",
      data: products,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProductsCount,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: "Internal server error" });
  }
};

const getProductsByCategory = async (req, res) => {
  const categoryName = req.params.category;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const startIndex = (page - 1) * limit;

  try {
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Category not found",
      });
    }

    const totalProductsCount = await Product.countDocuments({
      category: category._id,
    });

    const products = await Product.find({ category: category._id })
      .populate("category", "name")
      .populate({
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
      })
      .sort({ dateCreated: -1 })
      .limit(limit)
      .skip(startIndex);

    const totalPages = Math.ceil(totalProductsCount / limit);

    if (!products.length) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No products found",
        data: [],
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Products fetched successfully",
      data: products,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProductsCount,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getProductsByUserId = async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const startIndex = (page - 1) * limit;

  try {
    const totalProductsCount = await Product.countDocuments({
      createdBy: userId,
    });

    const products = await Product.find({ createdBy: userId })
      .select(
        "name unit_price discounted_price description quantity category image images brand createdBy status rating numReviews isFeatured flashsale isTrending isDealOfTheDay saleCount dateCreated moq approved sku"
      )
      .populate("category", "name")
      .populate({
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
      })
      .sort({ dateCreated: -1 })
      .limit(limit)
      .skip(startIndex);

    if (!products || products.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "No products found for this user",
      });
    }

    const totalPages = Math.ceil(totalProductsCount / limit);

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Products fetched successfully",
      data: products,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch products. " + error.message,
    });
  }
};

const getProductsByBrand = async (req, res) => {
  try {
    let brand = req.params.brand;
    brand = brand.toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    const startIndex = (page - 1) * limit;

    const totalProductsCount = await Product.countDocuments({
      brand: { $regex: new RegExp(brand, "i") },
    });
    const totalPages = Math.ceil(totalProductsCount / limit);
    const products = await Product.find({
      brand: { $regex: new RegExp(brand, "i") },
    })
      .populate({
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
      })
      .populate("category", "name")
      .limit(limit)
      .skip(startIndex);
    if (products.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No products found",
        data: products,
      });
    }
    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Products fetched successfully",
      data: products,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProductsCount,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: error.message });
  }
};

const getDiscountedProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const startIndex = (page - 1) * limit;
  try {
    const discountedProducts = await Product.find({
      discounted_price: { $gt: 0 },
    })
      .populate("category", "name")
      .populate({
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
      })
      .sort({ dateCreated: -1 })
      .limit(limit)
      .skip(startIndex);

    const totalProductsCount = await Product.countDocuments({
      discounted_price: { $gt: 0 },
    });
    const totalPagesCount = Math.ceil(totalProductsCount / limit);

    if (!discountedProducts || discountedProducts.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No products found",
        data: discountedProducts,
      });
    }
    return res.json({
      status: true,
      message: "Products fetched successfully",
      data: discountedProducts,
      currentPage: page,
      totalPages: totalPagesCount,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: error.message });
  }
};

const getTrendingProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const startIndex = (page - 1) * limit;
  try {
    const trendingProducts = await Product.find({
      isTrending: true,
    })
      .populate("category", "name")
      .populate({
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
      })
      .sort({ dateCreated: -1 })
      .limit(limit)
      .skip(startIndex);

    const totalProductsCount = await Product.countDocuments({
      isTrending: true,
    });
    const totalPagesCount = Math.ceil(totalProductsCount / limit);

    if (!trendingProducts || trendingProducts.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No products found",
        data: trendingProducts,
      });
    }
    return res.json({
      status: true,
      message: "Products fetched successfully",
      data: trendingProducts,
      currentPage: page,
      totalPages: totalPagesCount,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: error.message });
  }
};

const getDealsOfTheDay = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const startIndex = (page - 1) * limit;
  try {
    const deals = await Product.find({
      isDealOfTheDay: true,
    })
      .populate("category", "name")
      .populate({
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
      })
      .sort({ dateCreated: -1 })
      .limit(limit)
      .skip(startIndex);

    const totalProductsCount = await Product.countDocuments({
      isDealOfTheDay: true,
    });
    const totalPagesCount = Math.ceil(totalProductsCount / limit);

    if (!deals || deals.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No products found",
        data: deals,
      });
    }
    return res.json({
      status: true,
      message: "Products fetched successfully",
      data: deals,
      currentPage: page,
      totalPages: totalPagesCount,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: error.message });
  }
};

const getFlashsaleProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const startIndex = (page - 1) * limit;
  const now = new Date();

  try {
    const flashsaleProducts = await Product.find({
      flashsale: true,
      flashsaleStartDate: { $lte: now },
      flashsaleEndDate: { $gte: now },
    })
      .populate("category", "name")
      .populate({
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender storeName storeUrl phoneNumber accountNumber bank role",
      })
      .sort({ dateCreated: -1 })
      .limit(limit)
      .skip(startIndex);

    const totalProductsCount = await Product.countDocuments({
      flashsale: true,
      flashsaleStartDate: { $lte: now },
      flashsaleEndDate: { $gte: now },
    });

    const totalPages = Math.ceil(totalProductsCount / limit);

    if (!flashsaleProducts.length) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No products found",
        data: [],
      });
    }

    return res.json({
      status: true,
      message: "Products fetched successfully",
      data: flashsaleProducts,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProductsCount,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
};

const getNewlyArrivedBrands = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const startIndex = (page - 1) * limit;
  try {
    const response = await Product.find({})
      .populate("category", "name")
      .populate({
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
      })
      .sort({ dateCreated: -1 })
      .limit(limit)
      .skip(startIndex);
    const brandMap = new Map();
    response.forEach((product) => {
      const brand = product.brand;
      if (!brandMap.has(brand)) {
        brandMap.set(brand, product.toObject());
      }
    });
    const products = Array.from(brandMap.values());

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Products fetched successfully",
      data: products,
      currentPage: page,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const updates = req.body;
    const options = { new: true };

    if (updates.flashsale) {
      if (!updates.flashsaleStartDate || !updates.flashsaleEndDate) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: "Flash sale start and end dates are required",
        });
      }

      const startDate = new Date(updates.flashsaleStartDate);
      const endDate = new Date(updates.flashsaleEndDate);

      if (endDate <= startDate) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: "Flash sale end date must be after the start date",
        });
      }
    }

    if (updates.quantity !== undefined && updates.quantity > 0) {
      updates.status = "inStock";
    }

    const result = await Product.findByIdAndUpdate(productId, updates, options);

    if (!result) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "Product not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Product updated successfully",
      data: result,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to update product",
    });
  }
};

const uploadProductImage = async (req, res) => {
  try {
    const base64String = req.body.base64String;
    const imageBuffer = Buffer.from(base64String, "base64");
    const image = await cloudinary.uploader.upload(imageBuffer, {
      folder: "supplya-assets",
    });
    cloudinary.image("myphoto", {
      transformation: [
        {
          dpr: "auto",
          responsive: true,
          width: "auto",
          crop: "scale",
          angle: 20,
        },
        { effect: "art:hokusai", border: "3px_solid_rgb:00390b", radius: 20 },
      ],
    });

    return res
      .status(StatusCodes.OK)
      .json({ status: true, data: image.secure_url });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, error: "Failed to upload image" });
  }
};

const approveProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(StatusCodes.OK).json({
        message: "Product not found",
        status: false,
      });
    }

    product.approved = true;
    await product.save();

    return res.status(StatusCodes.OK).json({
      message: "Product successfully approved",
      status: true,
      data: product,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to approve product",
      status: false,
    });
  }
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.id;
  try {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "No product found",
      });
    }
    return res
      .status(StatusCodes.OK)
      .json({ status: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: "Failed to delete product" });
  }
};

const deleteProductsWithoutVendor = async (req, res, next) => {
  try {
    const result = await Product.deleteMany({ createdBy: null });

    return res.status(200).json({
      status: "success",
      message: "Products without vendors deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting products: ", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to delete products",
      error: error.message,
    });
  }
};

const bulkdeleteProducts = async (req, res) => {
  try {
    const products = await Product.find({}, "_id");
    const ids = products.map((product) => product._id);

    if (ids.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "No products found to delete.",
      });
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: `${result.deletedCount} product(s) deleted successfully.`,
    });
  } catch (error) {
    console.error("Error in bulk delete operation:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: "Internal server error" });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === "") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Please provide a valid search keyword",
      });
    }

    const productsByName = await Product.find({
      name: { $regex: keyword, $options: "i" },
    });

    const usersByStoreName = await User.find({
      storeName: { $regex: keyword, $options: "i" },
    });
    const vendorIds = usersByStoreName.map((user) => user._id);
    const productsByVendor = await Product.find({
      createdBy: { $in: vendorIds },
    });

    const products = [...productsByName, ...productsByVendor];

    if (products.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "No products found matching the search keyword",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Products found successfully",
      data: products,
    });
  } catch (error) {
    console.error("Failed to search products:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: "Failed to search products" });
  }
};

const manageFlashSales = async () => {
  try {
    const now = new Date();
    const flashsaleProducts = await Product.find({
      flashsale: true,
      flashsaleEndDate: { $gte: now },
    });

    const totalFlashsaleProducts = flashsaleProducts.length;
    const batches = Math.ceil(totalFlashsaleProducts / 100);
    const currentBatch = Math.floor((now.getDate() - 1) % batches);

    const productsToDisplay = flashsaleProducts
      .sort(
        (a, b) =>
          new Date(a.flashsaleStartDate) - new Date(b.flashsaleStartDate)
      )
      .slice(currentBatch * 100, (currentBatch + 1) * 100);

    // Update products to be displayed
    await Promise.all(
      productsToDisplay.map(async (product) => {
        product.unit_price = product.discounted_price;
        await product.save();
      })
    );

    // Reset products after flash sale ends
    const expiredFlashsales = await Product.find({
      flashsale: true,
      flashsaleEndDate: { $lt: now },
    });

    await Promise.all(
      expiredFlashsales.map(async (product) => {
        product.flashsale = false;
        product.discounted_price = product.unit_price;
        await product.save();
      })
    );
  } catch (error) {
    console.error("Error managing flash sales:", error);
  }
};

cron.schedule("0 0 * * *", manageFlashSales);

module.exports = {
  importProducts,
  createProduct,
  submitProduct,
  duplicateProduct,
  approveProduct,
  getAllProducts,
  getProductsByVendor,
  getProductsByUserId,
  getProductsByBrand,
  getProductsByCategory,
  getNewlyArrivedBrands,
  getProductById,
  getRelatedProducts,
  getFlashsaleProducts,
  getDiscountedProducts,
  getDealsOfTheDay,
  getTrendingProducts,
  updateProduct,
  uploadProductImage,
  deleteProductsWithoutVendor,
  deleteProduct,
  bulkdeleteProducts,
  searchProducts,
};

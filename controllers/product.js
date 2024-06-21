const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");
const User = require("../models/User");
const Category = require("../models/Category");
// const userController = require("../controllers/user");
// const notificationService = require("../middleware/notification");
const { approveProductMail } = require("../middleware/mailUtil");

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

  const product = req.body;

  if (!product) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: "Please enter all required fields",
    });
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
      return res.status(StatusCodes.NOT_FOUND).json({
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
        "name unit_price discounted_price description quantity category image images brand createdBy status rating numReviews isFeatured flashsale saleCount dateCreated moq approved sku"
      )
      .populate("category", "name")
      .sort({ dateCreated: -1 })
      .limit(limit)
      .skip(startIndex);

    if (products.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
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

const getRelatedProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Product not found",
        data: currentProduct,
      });
    }

    const relatedProducts = await Product.find({
      category: currentProduct.category,
      _id: { $ne: productId },
    })
      .limit(10)
      .select("name unit_price discounted_price description image status");

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Products fetched successfully",
      data: relatedProducts,
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
    // const endIndex = page * limit;

    const totalProducts = await Product.countDocuments({ createdBy: vendorId });
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find({ createdBy: vendorId })
      .select(
        "name unit_price discounted_price description quantity category image images brand createdBy status rating numReviews isFeatured flashsale saleCount dateCreated moq approved sku"
      )
      .populate("category", "name")
      .sort({ dateCreated: -1 })
      .limit(limit)
      .skip(startIndex);

    if (!products || products.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
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
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: "Internal server error" });
  }
};

const getProductsByCategory = async (req, res) => {
  const categoryName = req.params.category;

  try {
    // Find the category by name
    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Category not found",
      });
    }

    // Find products by category ID
    const products = await Product.find({ category: category._id });

    if (!products.length) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "No products found",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Products fetched successfully",
      products, // Return the fetched products
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getProductsByBrand = async (req, res) => {
  try {
    let brand = req.params.brand;
    brand = brand.toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;

    const totalProducts = await Product.countDocuments({
      brand: { $regex: new RegExp(brand, "i") },
    });
    const totalPages = Math.ceil(totalProducts / limit);
    const products = await Product.find({
      brand: { $regex: new RegExp(brand, "i") },
    })
      .populate({
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
      })
      .limit(limit)
      .skip(startIndex);
    if (products.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "No products found for the given brand",
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
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: error.message });
  }
};

const getDiscountedProducts = async (req, res) => {
  try {
    const discountedProducts = await Product.find({
      discounted_price: { $gt: 0 },
    });
    if (!discountedProducts || discountedProducts.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "No products found with discount",
        data: discountedProducts,
      });
    }
    return res.json({
      status: true,
      message: "Products fetched successfully",
      data: discountedProducts,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: error.message });
  }
};

const getFlashsaleProducts = async (req, res) => {
  try {
    const flashsaleProducts = await Product.find({ flashsale: true });
    if (!flashsaleProducts || flashsaleProducts.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "No flashsale products found",
        data: flashsaleProducts,
      });
    }
    return res.json({
      status: true,
      message: "Products fetched successfully",
      data: flashsaleProducts,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: error.message });
  }
};

const getNewlyArrivedBrands = async (req, res, next) => {
  try {
    const response = await Product.find({}).sort({ dateCreated: -1 }).limit(10);
    const brandMap = new Map();
    response.forEach((product) => {
      const brand = product.brand;
      if (!brandMap.has(brand)) {
        brandMap.set(brand, product.toObject());
      }
    });
    const products = Array.from(brandMap.values());

    return res.status(StatusCodes.OK).json({ status: true, data: products });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message,
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
      "name unit_price discounted_price description quantity category image images brand status createdBy rating numReviews isFeatured flashsale saleCount dateCreated moq approved sku"
    )
    .populate("category", "name")
    .then((product) => {
      if (!product) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: false,
          message: "Product not found",
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

const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const updates = req.body;
    const options = { new: true };

    const result = await Product.findByIdAndUpdate(productId, updates, options);
    if (!result) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: "Product not found" });
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
      return res.status(StatusCodes.NOT_FOUND).json({
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
        message: `Product with id ${productId} not found.`,
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

module.exports = {
  createProduct,
  submitProduct,
  approveProduct,
  getAllProducts,
  getProductsByVendor,
  getProductsByBrand,
  getProductsByCategory,
  getNewlyArrivedBrands,
  getProductById,
  getRelatedProducts,
  getFlashsaleProducts,
  getDiscountedProducts,
  updateProduct,
  uploadProductImage,
  deleteProduct,
  bulkdeleteProducts,
  searchProducts,
};

const Media = require("../models/Media");
const { StatusCodes } = require("http-status-codes");

const uploadHomepageBanners = async (req, res) => {
  try {
    const userId = req.user?.userid;
    const { banners } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "User ID missing from request." });
    }

    if (!Array.isArray(banners) || banners.length < 1 || banners.length > 3) {
      return res.status(400).json({
        status: false,
        message: "You must upload between 1 and 3 homepage banners.",
      });
    }

    const allowedSections = [
      "TopBarBanner",
      "HeroBanner",
      "SpecialBanner",
      "PopularDealsBanner",
      "FlashSalesBanner",
      "BillboardBanner",
      "SkyscraperLeftBanner",
      "SkyscraperRightBanner",
      "FooterBanner",
      "SpecialDealsBanner",
      "CategoryTopBanner",
      "CategoryBottomBanner",
      "HomeMobileTopBanner",
      "HomeMobileMiddleBanner",
    ];

    const invalidSections = banners
      .map((b) => b.section)
      .filter((section) => !allowedSections.includes(section));

    if (invalidSections.length > 0) {
      return res.status(400).json({
        status: false,
        message: `Invalid section(s): ${invalidSections.join(
          ", "
        )}. Allowed sections: ${allowedSections.join(", ")}`,
      });
    }

    const bannerDocs = banners.map((b) => ({
      section: b.section,
      image: b.image,
      description: b.description || "",
      redirectUrl: b.redirectUrl || null,
      platform: b.platform || "web",
      vendor: req.user.role === "vendor" ? userId : undefined,
    }));

    const saved = await Media.insertMany(bannerDocs, { runValidators: true });

    return res.status(201).json({
      status: true,
      message: "Homepage banners uploaded successfully.",
      data: saved,
    });
  } catch (error) {
    console.error("uploadHomepageBanners error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to upload homepage banners." });
  }
};

// ✅ Get banners by section (e.g., HeroBanner)
const getBannersBySection = async (req, res) => {
  try {
    const { section } = req.params;
    const banners = await Media.find({ section });
    return res.status(StatusCodes.OK).json({
      status: true,
      message: `Banners fetched for section: ${section}`,
      data: banners,
    });
  } catch (error) {
    console.error("getBannersBySection error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch banners by section.",
    });
  }
};

// ✅ Get banners uploaded by a specific user (vendor)
const getBannersByUser = async (req, res) => {
  try {
    const userId = req.user?.userid;
    const banners = await Media.find({ vendor: userId });
    return res.status(StatusCodes.OK).json({
      status: true,
      message: "User banners fetched successfully.",
      data: banners,
    });
  } catch (error) {
    console.error("getBannersByUser error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch user banners.",
    });
  }
};

// ✅ Get a single banner by ID
const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Media.findById(id);

    if (!banner) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Banner not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Banner fetched successfully",
      data: banner,
    });
  } catch (error) {
    console.error("getBannerById error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch banner",
    });
  }
};

// ✅ Patch update a single banner
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.userid;
    const userRole = req.user?.role;

    const banner = await Media.findById(id);
    if (!banner) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Banner not found.",
      });
    }

    if (userRole !== "admin" && banner.vendor?.toString() !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: false,
        message: "Not authorized to update this banner.",
      });
    }

    const updated = await Media.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Banner updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("updateBanner error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to update banner.",
    });
  }
};

// ✅ Get all banners with optional section search + pagination
const getAllBanners = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || "";

    // Build filter with optional search
    let filter = {};
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery.trim(), "i"); // case-insensitive
      filter = {
        $or: [
          { section: { $regex: searchRegex } },
          { platform: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
        ],
      };
    }

    const [banners, totalCount] = await Promise.all([
      Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Media.countDocuments(filter),
    ]);

    if (banners.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No banners found",
        data: [],
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Banners fetched successfully",
      data: banners,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalMedia: totalCount,
    });
  } catch (error) {
    console.error("getAllBanners error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch banners",
    });
  }
};

// ✅ Get only admin/system homepage banners (those with no vendor field)
const getAdminHomepageBanners = async (req, res) => {
  const { page = 1, limit = 15, section } = req.query;
  const skip = (page - 1) * limit;

  try {
    const query = {
      vendor: { $exists: false },
    };
    if (section) {
      query.section = { $regex: new RegExp(section, "i") };
    }

    const [banners, totalCount] = await Promise.all([
      Media.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Media.countDocuments(query),
    ]);

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Admin homepage banners fetched successfully",
      data: banners,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalMedia: totalCount,
    });
  } catch (error) {
    console.error("getAdminHomepageBanners error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch admin banners",
    });
  }
};

// Delete one or all banners
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userid;
    const userRole = req.user?.role;

    let deleted;
    if (id === "all") {
      const query = userRole === "admin" ? {} : { vendor: userId };
      deleted = await Media.deleteMany(query);
    } else {
      const banner = await Media.findById(id);
      if (!banner) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: false,
          message: "Banner not found.",
        });
      }
      if (userRole !== "admin" && banner.vendor?.toString() !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          status: false,
          message: "Not authorized to delete this banner.",
        });
      }
      deleted = await Media.findByIdAndDelete(id);
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Banner(s) deleted successfully.",
    });
  } catch (error) {
    console.error("deleteBanner error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to delete banner(s).",
    });
  }
};

module.exports = {
  uploadHomepageBanners,
  getBannersBySection,
  getBannersByUser,
  getBannerById,
  getAllBanners,
  getAdminHomepageBanners,
  updateBanner,
  deleteBanner,
};

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

    const allowedTags = [
      "HeroBanner",
      "SkyscraperBanner",
      "FooterBanner",
      "SpecialDealsBanner",
    ];

    // Validate all banner tags
    const invalidTags = banners
      .map((b) => b.tag)
      .filter((tag) => !allowedTags.includes(tag));

    if (invalidTags.length > 0) {
      return res.status(400).json({
        status: false,
        message: `Invalid tag(s): ${invalidTags.join(
          ", "
        )}. Allowed tags: ${allowedTags.join(", ")}`,
      });
    }

    // Prepare banner documents
    const bannerDocs = banners.map((b) => ({
      tag: b.tag,
      image: b.image,
      description: b.description || "",
      redirectUrl: b.redirectUrl || null,
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
    return res.status(500).json({
      status: false,
      message: "Failed to upload homepage banners.",
    });
  }
};

// Get banners by tag (e.g., HeroBanner)
const getBannersByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const banners = await Media.find({ tag });
    return res.status(StatusCodes.OK).json({
      status: true,
      message: `Banners fetched for tag: ${tag}`,
      data: banners,
    });
  } catch (error) {
    console.error("getBannersByTag error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch banners by tag.",
    });
  }
};

// Get banners uploaded by a specific user
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

// Patch update a single banner
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

const getAllBanners = async (req, res) => {
  const { page = 1, limit = 15, tag } = req.query;
  const skip = (page - 1) * limit;

  try {
    const query = {};
    if (tag) {
      query.tag = { $regex: new RegExp(tag, "i") };
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
      message: "Media fetched successfully",
      data: banners,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalMedia: totalCount,
    });
  } catch (error) {
    console.error("getAllBanners error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch media",
    });
  }
};

// ✅ Get only admin/system homepage banners (those with no vendor field)
const getAdminHomepageBanners = async (req, res) => {
  const { page = 1, limit = 15, tag } = req.query;
  const skip = (page - 1) * limit;

  try {
    const query = {
      vendor: { $exists: false },
    };
    if (tag) {
      query.tag = { $regex: new RegExp(tag, "i") };
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
  getBannersByTag,
  getBannersByUser,
  getAllBanners,
  getAdminHomepageBanners,
  updateBanner,
  deleteBanner,
};

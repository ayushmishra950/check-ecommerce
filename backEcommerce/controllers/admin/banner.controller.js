const Banner = require("../../models/banner.model");
const {uploadToCloudinary} = require("../../cloudinary/uploadImageToCloudinary");

// ✅ Create Banner
const createBanner = async (req, res) => {
  try {
    const { title, link, order, startDate, endDate, shopId, userId, isActive } = req.body;

    const imageFile = req?.files?.image?.[0];

    // ✅ Validation
    if (!title || !shopId || !imageFile) {
      return res.status(400).json({
        message: "Title, Image and ShopId are required",
      });
    }

    // ✅ Upload image to Cloudinary
    let imageUrl = "";
    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile.buffer);
    }

    // ✅ Create Banner
    const banner = await Banner.create({
      title,
      image: imageUrl,
      link,
      order,
      startDate,
      endDate,
      shopId,
      createdBy: userId,
      isActive: isActive==="active"?true : false
    });

    res.status(201).json({
      message: "Banner created successfully",
      data: banner,
    });

  } catch (error) {
    console.log(error?.message);

    res.status(500).json({
      message: error?.message ? error.message : "Error creating banner",
      error: error.message,
    });
  }
};

// ✅ Get All Banners (Admin)
const getAllBanners = async (req, res) => {
  try {
    const { shopId } = req.query;

    const banners = await Banner.find({ shopId }).sort({ order: 1 });

    res.status(200).json({
      message: "Banner list fetched",
      data: banners,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching banners",
      error: error.message,
    });
  }
};

// ✅ Get Active Banners (Frontend - Slider)
const getActiveBanners = async (req, res) => {
  try {
    
    const now = new Date();

    const banners = await Banner.find({
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: { $lte: now } },
          ],
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: now } },
          ],
        },
      ],
    }).sort({ order: 1 });

    res.status(200).json({
      message: "Active banners fetched",
      data: banners,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching active banners",
      error: error.message,
    });
  }
};

const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBanner = await Banner.findById(id);
    if (!existingBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    let imageUrl = existingBanner.image;

    // Check if new file is uploaded
    const imageFile = req?.files?.image?.[0];

    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile.buffer);
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    // ✅ Convert "active" to Boolean if it exists
    const updateData = {
      ...req.body,
      image: imageUrl,
    };
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === "active" || updateData.active === true;
    }

    // Update banner
    const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      message: "Banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    console.log(error?.message);
    res.status(500).json({
      message: error?.message || "Error updating banner",
      error: error.message,
    });
  }
};


// ✅ Delete Banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({
        message: "Banner not found",
      });
    }

    res.status(200).json({
      message: "Banner deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting banner",
      error: error.message,
    });
  }
};

// ✅ Change Status (Active / Inactive)
const changeBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const banner = await Banner.findByIdAndUpdate(
      id,
      { isActive: status },
      { new: true }
    );

    res.status(200).json({
      message: "Banner status updated",
      data: banner,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating status",
      error: error.message,
    });
  }
};


module.exports = {
  createBanner,
  getAllBanners,
    getActiveBanners,
    updateBanner,
    deleteBanner,
    changeBannerStatus,
};
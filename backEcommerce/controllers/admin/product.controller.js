const Product = require("../../models/product.model");
const Shop = require("../../models/shop.model");
const Admin = require("../../models/admin.model");
const {uploadToCloudinary} = require("../../cloudinary/uploadImageToCloudinary");
const Category = require("../../models/category.model");


const validateShopAndAdmin = async (shopId, adminId) => {
  if (!shopId || !adminId) {
    return { success: false, code: 400, message: "shopId and adminId are required" };
  }

  // Check Shop
  const shop = await Shop.findById(shopId);
  if (!shop) {
    return { success: false, code: 404, message: "Shop not found" };
  }

  // Check Admin
  const admin = await Admin.findOne({ _id: adminId, shopId });
  if (!admin) {
    return { success: false, code: 404, message: "Admin not found" };
  }

  if (admin.role !== "admin") {
    return { success: false, code: 403, message: "Only admin can perform this action" };
  }

  return { success: true}; // return objects for further use
};



const createProduct = async (req, res) => {
  try {
    const { shopId, adminId,brand, name,price,category, stock, description, isActive, discount, discountType  } = req.body;
    const images = req.files?.images || [];
   
    if(!shopId || !adminId || !brand || !name || !category  || !price ||  !stock || !description || !isActive){
    return res.status(400).json({message:"All Fields Are Required."})
    }

    // ✅ 1. Validate Shop & Admin
    const validated = await validateShopAndAdmin(shopId, adminId);
    if (!validated.success) {
      return res.status(validated.code).json({ success: false, message: validated.message });
    }

    // ✅ 2. Check if product with same name already exists in the shop
    const existingProduct = await Product.findOne({ shopId, name });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product with this name already exists in this shop",
      });
    }

    // ✅ 3. Upload images to Cloudinary
    let imageUrls = [];
    if (Array.isArray(images) && images.length > 0) {
      imageUrls = await Promise.all(
        images.map(async (img) => {
          const url = await uploadToCloudinary(img?.buffer);
          return url;
        })
      );
    }

    // ✅ 3. Create the product
    const product = await Product.create({
      name,
      price, stock, description, isActive,
      shopId,
      adminId,
      brand,
      images: imageUrls,
      category,
      discount,
       discountType
    });

   await Category.findByIdAndUpdate(category, {$addToSet: {product: [product?._id]}},{new:true})
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    // Handle duplicate key error (if schema index is used)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate product found",
      });
    }
     console.log(error?.message)
    res.status(500).json({
      success: false,
      message: `Product creation failed:- ${error.message}`,
      error: error.message,
    });
  }
};


const getProducts = async (req, res) => {
  try {
    const { shopId, adminId } = req.query;

     await validateShopAndAdmin(shopId, adminId);

    const products = await Product.find({
      shopId,
      adminId,
    }).populate("category", "name").populate("adminId", "name email");
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};


const getProductById = async (req, res) => {
  const {id} = req.params;
  console.log(id);
  if(!id) return res.status(400).json({message:"Product Id Not Found."})
  try {
    const product = await Product.findById(id)
      .populate("category", "name")
      .populate("adminId", "name email")
      .populate("rating", "rating feedback");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const validated = await validateShopAndAdmin(
      product.shopId,
      product.adminId
    );
    if (!validated) return;

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// const updateProduct = async (req, res) => {
//   try {
//     const { shopId, adminId, name,price,category, stock, description, isActive, discount, discountType } = req.body;
//     const images = req.files?.images || [];
//     console.log(images)

//     // ✅ 1. Find Product
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     // ✅ 2. Validate Shop & Admin
//     const validated = await validateShopAndAdmin(
//       shopId,
//       adminId
//     );

//     if (!validated.success) {
//       return res
//         .status(validated.code)
//         .json({ success: false, message: validated.message });
//     }

//     // ✅ 3. Check duplicate name (if name is being changed)
//     if (name && name !== product.name) {
//       const existingProduct = await Product.findOne({
//         shopId: product.shopId,
//         name,
//         _id: { $ne: product._id }, // exclude current product
//       });

//       if (existingProduct) {
//         return res.status(400).json({
//           success: false,
//           message: "Product with this name already exists in this shop",
//         });
//       }
//     }

//     // ✅ 4. Upload new images (if provided)
//     let imageUrls = product.images || [];

//     if (Array.isArray(images) && images.length > 0) {
//       const uploadedImages = await Promise.all(
//         images.map(async (img) => {
//           const url = await uploadToCloudinary(img?.buffer);
//           return url;
//         })
//       );
 
//       // Replace old images with new ones
//       imageUrls = uploadedImages;
//     }
//     console.log("convert url", imageUrls);

//     // ✅ 5. Update product fields
//     product.name = name ?? product.name;
//     product.price = price ?? product.price;
//     product.category = category ?? product.category;
//     product.stock = stock ?? product.stock;
//     product.description = description ?? product.description;
//     product.isActive = isActive ?? product.isActive;
//     product.images = [...updatedImageUrls, ...uploadedNewImages];
//     product.discount = discount;
//     product.discountType = discountType;

//     await product.save();

//     res.status(200).json({
//       success: true,
//       message: "Product updated successfully",
//       data: product,
//     });
//   } catch (error) {
//     console.log(error?.message);

//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Duplicate product found",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: `Product update failed:- ${error.message}`,
//       error: error.message,
//     });
//   }
// };








const updateProduct = async (req, res) => {
  try {
    const {
      shopId,
      adminId,
      name,
      brand,
      price,
      category,
      stock,
      description,
      isActive,
      discount,
      discountType,
      images // old image urls from frontend
    } = req.body;

    const newFiles = req.files?.images || [];

    // ✅ 1. Find Product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ 2. Validate Shop & Admin
    const validated = await validateShopAndAdmin(shopId, adminId);

    if (!validated.success) {
      return res
        .status(validated.code)
        .json({ success: false, message: validated.message });
    }

    // ✅ 3. Check duplicate name
    if (name && name !== product.name) {
      const existingProduct = await Product.findOne({
        shopId: product.shopId,
        name,
        _id: { $ne: product._id },
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Product with this name already exists in this shop",
        });
      }
    }

    // ✅ 4. Convert old image URLs safely to array
    let keepImages = [];

    if (images) {
      if (Array.isArray(images)) {
        keepImages = images;
      } else if (typeof images === "string") {
        keepImages = [images];
      }
    }

    // ✅ 5. Upload new images to Cloudinary
    let uploadedImages = [];

    if (Array.isArray(newFiles) && newFiles.length > 0) {
      uploadedImages = await Promise.all(
        newFiles.map(async (file) => {
          const url = await uploadToCloudinary(file.buffer);
          return url;
        })
      );
    }

    // ✅ 6. Final images merge
    product.images = [...keepImages, ...uploadedImages];

    // ✅ 7. Update other fields
    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.stock = stock ?? product.stock;
    product.description = description ?? product.description;
    product.isActive = isActive ?? product.isActive;
    product.discount = discount ?? product.discount;
    product.discountType = discountType ?? product.discountType;
    product.brand = brand ?? product.brand;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });

  } catch (error) {
    console.error(error.message);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate product found",
      });
    }

    res.status(500).json({
      success: false,
      message: `Product update failed: ${error.message}`,
    });
  }
};

const deleteProduct = async (req, res) => {
   const {adminId, shopId, id} = req.query;
  try {

      await validateShopAndAdmin(shopId,adminId);

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

  const cat = await Category.updateMany(
  { product: product._id },
  { $pull: { product : product._id } }
);

console.log(cat)
    await product.deleteOne();


    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product deletion failed",
      error: error.message,
    });
  }
};

const toggleProductStatus = async(req,res) => {
  try{
        const {productId, adminId, shopId, status} = req.body;
       await validateShopAndAdmin( shopId, adminId);

       const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found"});
    }

    product.isActive = status;
    product.save();

     res.status(200).json({message:`Status ${status?"Active":"In-Active"} Successfully.`})
  }
  catch(err){
    res.status(500).json({message:`Error:- ${err.message}`})
  }
}

module.exports = {deleteProduct, updateProduct, getProductById, getProducts, createProduct, toggleProductStatus};
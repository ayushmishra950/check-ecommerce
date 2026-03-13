const Rating = require("../../models/rating.model");
const Product = require("../../models/product.model");


// ADD RATING
const addRating = async (req, res) => {
    try {

        const ratings = req.body;   // array
        const userId = req.user.id;

        const createdRatings = [];

        for (const item of ratings) {

            const { productId, rating, feedback } = item;

            const existingRating = await Rating.findOne({
                userId,
                productId
            });

            if (!existingRating) {

                const newRating = await Rating.create({
                    productId,
                    userId,
                    rating,
                    feedback
                });

                createdRatings.push(newRating);
                // Fetch product
                const product = await Product.findById(productId);

                if (product) {
                    product.rating.push(newRating._id); // push rating id
                    await product.save();
                }
            }
        }

        res.status(201).json({
            success: true,
            data: createdRatings
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// GET ALL RATINGS BY PRODUCT
const getUnratedProducts = async (req, res) => {
    try {

        let productIds = req.query['productIds[]'];
        console.log(productIds)

        if (!productIds) {
            return res.status(400).json({
                success: false,
                message: "productIds required"
            })
        }

        // अगर single id आये तो array बना दो
        if (!Array.isArray(productIds)) {
            productIds = [productIds];
        }
        const userId = req.user?.id;

        // user ne jin products ko rating di hai
        const ratedProducts = await Rating.find({
            productId: { $in: productIds },
            userId: userId
        }).select("productId");

        const ratedProductIds = ratedProducts.map(r => r.productId.toString());

        // jin products ko rating nahi di
        const unratedProducts = productIds.filter(
            id => !ratedProductIds.includes(id)
        );

        res.status(200).json({
            success: true,
            data: unratedProducts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};




// GET ALL RATINGS BY PRODUCT
const getProductRatings = async (req, res) => {
    try {

        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId required"
            })
        }

        // user ne jin products ko rating di hai
        const ratedProducts = await Rating.find({
            userId: userId
        }).populate("productId");

        res.status(200).json({
            success: true,
            count: ratedProducts.length,
            data: ratedProducts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};




// GET RATINGS BY SHOP
const getShopRatings = async (req, res) => {
    try {

        const { shopId } = req.params;

        const ratings = await Rating.find({ shopId });

        res.status(200).json({
            success: true,
            count: ratings.length,
            data: ratings
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// UPDATE RATING
const updateRating = async (req, res) => {
    try {
        console.log(req.body)
        const { id, ...obj } = req.body;
        let updateObj = {
            userId: req.user?.id,
            productId: obj.productId,
            rating: obj.rating,
            feedback: obj.feedback
        }

        const updatedRating = await Rating.findByIdAndUpdate(
            id,
            updateObj,
            { new: true }
        );

        if (!updatedRating) {
            return res.status(404).json({
                success: false,
                message: "Rating not found"
            });
        }

        res.status(200).json({
            success: true,
            data: updatedRating
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// DELETE RATING
const deleteRating = async (req, res) => {
    try {

        const { id } = req.params;
        const userId = req.user?.id;
        if (!id || !userId) return res.status(400).json({ message: "Rating id or userId Not Found." })

        const rating = await Rating.findOneAndDelete({ _id: id, userId: userId });

        if (rating) {
            const product = await Product.findById(rating.productId);
            if (product) {
                // Remove the rating id from product's rating array
                product.rating.pull(rating._id);  // pull mutates the array in place
                await product.save();
            }
        }

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: "Rating not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Rating deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    addRating,
    getProductRatings,
    getUnratedProducts,
    getShopRatings,
    updateRating,
    deleteRating
};

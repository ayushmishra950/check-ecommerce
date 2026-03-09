const Rating = require("../../models/rating.model");


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
            console.log(newRating)
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
const getProductRatings = async (req, res) => {
    try {

        const { productId } = req.params;

        const ratings = await Rating.find({ productId })
            .populate("userId", "name");

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

        const { id } = req.params;

        const updatedRating = await Rating.findByIdAndUpdate(
            id,
            req.body,
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

        const rating = await Rating.findByIdAndDelete(id);

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
    getShopRatings,
    updateRating,
    deleteRating
};

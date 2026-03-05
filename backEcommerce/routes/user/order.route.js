const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/user/order.controller");
// const auth = require("../middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: User Order Management APIs
 */

/**
 * @swagger
 * /api/orders/place:
 *   post:
 *     summary: Place order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: "221B Baker Street"
 *                   city:
 *                     type: string
 *                     example: "Delhi"
 *                   state:
 *                     type: string
 *                     example: "Delhi"
 *                   postalCode:
 *                     type: string
 *                     example: "110001"
 *                   country:
 *                     type: string
 *                     example: "India"
 *               paymentMethod:
 *                 type: string
 *                 enum: [COD, CARD, UPI]
 *                 example: "COD"
 *     responses:
 *       201:
 *         description: Order placed successfully
 */
router.post("/add", orderController.placeOrder);

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Get logged-in user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 */
router.get("/my-orders", orderController.getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get single order details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details fetched
 *       404:
 *         description: Order not found
 */
router.get("/getbyid", orderController.getOrderById);

/**
 * @swagger
 * /api/orders/cancel/{id}:
 *   put:
 *     summary: Cancel order (only if not shipped)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled
 */
router.put("/cancel/:id", orderController.cancelOrder);

module.exports = router;

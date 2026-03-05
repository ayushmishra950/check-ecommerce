const express = require("express");
const router = express.Router();

const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require("../../controllers/admin/order.controller");

/**
 * @swagger
 * tags:
 *   name: Admin Orders
 *   description: Order management (Admin & SuperAdmin)
 */

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin Orders]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin or SuperAdmin ID
 *     responses:
 *       200:
 *         description: List of orders
 *       403:
 *         description: Access denied
 */
router.get("/get", getAllOrders);

/**
 * @swagger
 * /admin/orders/{id}:
 *   get:
 *     summary: Get single order by ID
 *     tags: [Admin Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin or SuperAdmin ID
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 *       403:
 *         description: Access denied
 */
router.get("/:id", getOrderById);

/**
 * @swagger
 * /admin/orders/{id}:
 *   put:
 *     summary: Update order status
 *     tags: [Admin Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               orderStatus:
 *                 type: string
 *                 example: "Shipped"
 *               paymentStatus:
 *                 type: string
 *                 example: "Paid"
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 *       403:
 *         description: Access denied
 */
router.put("/:id", updateOrderStatus);

/**
 * @swagger
 * /admin/orders/{id}:
 *   delete:
 *     summary: Delete order (SuperAdmin only)
 *     tags: [Admin Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       403:
 *         description: Only super admin allowed
 */
router.delete("/:id", deleteOrder);

module.exports = router;

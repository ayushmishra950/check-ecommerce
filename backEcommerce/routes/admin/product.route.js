const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} = require("../../controllers/admin/product.controller");
const upload = require("../../cloudinary/upload");
// Middleware for authentication
// const { verifyAdminToken } = require("../../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Admin Products
 *   description: Product management (Admin & SuperAdmin)
 */

/**
 * @swagger
 * /admin/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       403:
 *         description: Access denied
 */
router.post("/", upload.fields([ { name: "images", maxCount: 5 }]), createProduct);

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Get all products (Admin → own products, SuperAdmin → all products)
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *       403:
 *         description: Access denied
 */
router.get("/", getProducts);

/**
 * @swagger
 * /admin/products/{id}:
 *   get:
 *     summary: Get single product by ID
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       403:
 *         description: Access denied
 *       404:
 *         description: Product not found
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     summary: Update product (Admin → own product, SuperAdmin → any product)
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Product not found
 */
router.put("/:id",upload.fields([
    { name: "images", maxCount: 5 }]), updateProduct);

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     summary: Delete product (Admin → own product, SuperAdmin → any product)
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Product not found
 */
router.delete("/", deleteProduct);

/**
 * @swagger
 * /admin/products/{id}/status:
 *   patch:
 *     summary: Toggle product active status (SuperAdmin only)
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product status updated
 *       403:
 *         description: Only super admin can change status
 *       404:
 *         description: Product not found
 */
router.patch("/status", toggleProductStatus);

module.exports = router;

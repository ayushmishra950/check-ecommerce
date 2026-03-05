const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
} = require("../../controllers/admin/user.controller");

// Middleware for authentication
// const { verifyAdminToken } = require("../../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Admin Users
 *   description: User management (Admin & SuperAdmin)
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: Admin user ID
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Access denied
 */
router.get("/get", getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get single user by ID
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: User details
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.get("/:id", getUserById);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update a user (Admin & SuperAdmin)
 *     tags: [Admin Users]
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
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.put("/:id", updateUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user (SuperAdmin only)
 *     tags: [Admin Users]
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
 *               userId:
 *                 type: string
 *                 description: SuperAdmin ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Only super admin allowed
 *       404:
 *         description: User not found
 */
router.delete("/:id", deleteUser);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   patch:
 *     summary: Toggle user active status (SuperAdmin only)
 *     tags: [Admin Users]
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
 *               userId:
 *                 type: string
 *                 description: SuperAdmin ID
 *     responses:
 *       200:
 *         description: User status updated
 *       403:
 *         description: Only super admin allowed
 *       404:
 *         description: User not found
 */
router.patch("/:id/status", toggleUserStatus);

module.exports = router;

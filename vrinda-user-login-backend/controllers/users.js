const moment = require("moment");
const Users = require("../models/users");

const bcrypt = require("bcrypt");
const AuditLogs = require("../models/auditLogs");
const Notifications = require("../models/notifications");

const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream/promises");


// ======================================================
// CREATE USER
// ======================================================

const createUser = async (req, reply) => {
  try {
    const {
      name,
      email,
      password,
      role,
      user_type,
      profile_pic,
      cover_pic,
      department,
      designation,
      attendance,
      status,
      added_by,
    } = req.body;

    const emailExists = await Users.userEmailExist(email);

    if (emailExists) {
      return reply.send({
        status: 0,
        message: "Email already exists",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      user_type,

      profile_pic: profile_pic || null,
      cover_pic: cover_pic || null,

      department,
      designation,
      attendance,

      status: status || 1,

      timestamp: moment().unix(),
      added_by: added_by || 1,
      updated_on: moment().unix(),
    };

    const newUserId = await Users.addUser(userData);

    if (newUserId) {
      console.log("1. Employee created:", name);

      await AuditLogs.addAuditLog(
        "Employee Added",
        name,
        "#10B981"
      );

      console.log("2. Audit log completed");

      const notificationResult =
        await Notifications.addNotification(
          "New employee joined",
          `${name} • ${department}`
        );

      console.log(
        "3. Notification result:",
        notificationResult
      );

      return reply.send({
        status: 1,
        message: "User created successfully",
        user_id: newUserId,
      });
    }

    return reply.send({
      status: 0,
      message: "Failed to create user",
    });

  } catch (error) {
    console.error("Error creating user:", error);

    return reply.status(500).send({
      status: 0,
      message: "Server error",
    });
  }
};


// ======================================================
// FETCH ALL USERS
// ======================================================

const fetchAllUsers = async (req, reply) => {
  try {
    const users = await Users.getAllUsers();

    console.log("ALL USERS:", users);

    if (users && users.length > 0) {
      return reply.send({
        status: 1,
        message: "Users fetched successfully",
        data: users,
      });
    }

    return reply.send({
      status: 0,
      message: "No users found",
    });

  } catch (error) {
    console.error("Error fetching users:", error);

    return reply.status(500).send({
      status: 0,
      message: "Server error",
    });
  }
};


// ======================================================
// UPDATE USER
// ======================================================

// ======================================================
// UPDATE USER / PROFILE
// ======================================================

const updateUser = async (req, reply) => {
  try {
    const {
      id,
      name,
      email,
      password,
      role,
      user_type,
      profile_pic,
      cover_pic,
      department,
      designation,

      // NEW PROFILE FIELDS
      phone,
      joining_date,
      address,
      bio,

      attendance,
      status,
      added_by,
    } = req.body;

    // --------------------------------------------------
    // Validate User ID
    // --------------------------------------------------

    if (!id) {
      return reply.send({
        status: 0,
        message: "User ID is required",
      });
    }

    // --------------------------------------------------
    // Check Email
    // --------------------------------------------------

    const emailExists = await Users.userEmailExist(
      email,
      id
    );

    if (emailExists) {
      return reply.send({
        status: 0,
        message: "Email already exists",
      });
    }

    // --------------------------------------------------
    // Prepare Update Data
    // --------------------------------------------------

    const updateData = {
      name,
      email,
      role,
      user_type,

      profile_pic: profile_pic || null,
      cover_pic: cover_pic || null,

      department,
      designation,

      // NEW PROFILE FIELDS
      phone: phone || null,
      joining_date: joining_date || null,
      address: address || null,
      bio: bio || null,

      attendance: attendance || "Present",

      status:
        status !== undefined
          ? status
          : 1,

      added_by:
        added_by || 1,

      updated_on:
        moment().unix(),
    };

    // --------------------------------------------------
    // Update Password Only If Provided
    // --------------------------------------------------

    if (password) {
      updateData.password =
        await bcrypt.hash(
          password,
          10
        );
    }

    // --------------------------------------------------
    // Update User
    // --------------------------------------------------

    const updated =
      await Users.updateUser(
        id,
        updateData
      );

    if (!updated) {
      return reply.send({
        status: 0,
        message: "Failed to update user",
      });
    }

    // --------------------------------------------------
    // Audit Log
    // --------------------------------------------------

    await AuditLogs.addAuditLog(
      "Employee Updated",
      name,
      "#F59E0B"
    );

    console.log(
      "Profile updated successfully:",
      id
    );

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return reply.send({
      status: 1,
      message:
        "User profile updated successfully",
    });

  } catch (error) {
    console.error(
      "Error updateUser:",
      error
    );

    return reply.status(500).send({
      status: 0,
      message: "Server error",
    });
  }
};

// ======================================================
// GET USER BY ID
// ======================================================

const getUserById = async (req, reply) => {
  try {
    const { id } = req.body;

    if (!id) {
      return reply.send({
        status: 0,
        message: "User ID is required",
      });
    }

    const user = await Users.getUserById(id);

    if (user) {
      return reply.send({
        status: 1,
        message: "User fetched successfully",
        data: user,
      });
    }

    return reply.send({
      status: 0,
      message: "User not found",
    });

  } catch (error) {
    console.error(
      "Error getUserByIdController:",
      error
    );

    return reply.status(500).send({
      status: 0,
      message: "Server error",
    });
  }
};


// ======================================================
// DELETE USER
// ======================================================

const deleteUser = async (req, reply) => {
  try {
    const { id } = req.body;

    if (!id) {
      return reply.send({
        status: 0,
        message: "User ID is required",
      });
    }

    const user = await Users.getUserById(id);

    if (!user) {
      return reply.send({
        status: 0,
        message: "User not found",
      });
    }

    const deleted =
      await Users.deleteUserModel(id);

    if (deleted) {
      await AuditLogs.addAuditLog(
        "Employee Deleted",
        user.name,
        "#EF4444"
      );

      return reply.send({
        status: 1,
        message: "User deleted successfully",
      });
    }

    return reply.send({
      status: 0,
      message: "Failed to delete user",
    });

  } catch (error) {
    console.error(
      "Error deleteUser:",
      error
    );

    return reply.status(500).send({
      status: 0,
      message: "Server error",
    });
  }
};


// ======================================================
// CHANGE PASSWORD
// ======================================================
// ======================================================
// CHANGE PASSWORD
// ======================================================
const changePassword = async (request, reply) => {
  try {
    const {
      id,
      currentPassword,
      password,
    } = request.body;

    console.log("=================================");
    console.log("CHANGE PASSWORD REQUEST");
    console.log("USER ID:", id);

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!id || !currentPassword || !password) {
      return reply.send({
        status: 0,
        message: "All password fields are required",
      });
    }

    // --------------------------------------------------
    // GET USER
    // IMPORTANT:
    // Do NOT use Users.findOne()
    // --------------------------------------------------

const user = await Users.getUserWithPassword(id);
    console.log("USER FOUND:", !!user);

    if (!user) {
      return reply.send({
        status: 0,
        message: "User not found",
      });
    }

    // --------------------------------------------------
    // CHECK CURRENT PASSWORD
    // --------------------------------------------------

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    console.log(
      "CURRENT PASSWORD MATCH:",
      passwordMatch
    );

    if (!passwordMatch) {
      return reply.send({
        status: 0,
        message: "Current password is incorrect",
      });
    }

    // --------------------------------------------------
    // HASH NEW PASSWORD
    // --------------------------------------------------

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // --------------------------------------------------
    // PASSWORD CHANGE TIME
    // --------------------------------------------------

    const passwordChangedAt = new Date();

    console.log(
      "PASSWORD CHANGED AT:",
      passwordChangedAt
    );

    // --------------------------------------------------
    // UPDATE DATABASE
    // --------------------------------------------------

    const updated = await Users.updateUser(
      id,
      {
        password: hashedPassword,

        password_changed_at:
          passwordChangedAt,

        updated_on:
          Math.floor(Date.now() / 1000),
      }
    );

    console.log(
      "DATABASE UPDATE RESULT:",
      updated
    );

    if (!updated) {
      return reply.send({
        status: 0,
        message: "Failed to update password",
      });
    }

    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    console.log("PASSWORD UPDATED SUCCESSFULLY");
    console.log("=================================");

    return reply.send({
      status: 1,
      message: "Password Updated Successfully",

      password_changed_at:
        passwordChangedAt,
    });

  } catch (error) {

    console.error(
      "================================="
    );

    console.error(
      "CHANGE PASSWORD ERROR:"
    );

    console.error(error);

    console.error(
      "================================="
    );

    return reply.status(500).send({
      status: 0,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================================================
// SEARCH USERS
// ======================================================

const searchUsers = async (req, reply) => {
  try {
    const { search } = req.body;

    const users =
      await Users.searchUsersModel(
        search
      );

    return reply.send({
      status: 1,
      message:
        "Users fetched successfully",
      data: users,
    });

  } catch (error) {
    console.error(
      "Error searchUsers:",
      error
    );

    return reply.status(500).send({
      status: 0,
      message: "Server Error",
    });
  }
};


// ======================================================
// UPLOAD PROFILE / COVER IMAGE
// ======================================================

const uploadUserImage = async (req, reply) => {
  try {
    /*
      Expected multipart form:

      user_id = 1
      type    = profile OR cover
      file    = image
    */

    const file = await req.file();

    if (!file) {
      return reply.send({
        status: 0,
        message: "Image file is required",
      });
    }

    const userId =
      file.fields?.user_id?.value ||
      file.fields?.id?.value;

    const imageType =
      file.fields?.type?.value || "profile";

    if (!userId) {
      return reply.send({
        status: 0,
        message: "User ID is required",
      });
    }

    if (
      imageType !== "profile" &&
      imageType !== "cover"
    ) {
      return reply.send({
        status: 0,
        message:
          "Image type must be profile or cover",
      });
    }

    // Check user exists
    const user =
      await Users.getUserById(userId);

    if (!user) {
      return reply.send({
        status: 0,
        message: "User not found",
      });
    }

    // Allowed image types
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedMimeTypes.includes(
        file.mimetype
      )
    ) {
      return reply.send({
        status: 0,
        message:
          "Only JPG, JPEG, PNG and WEBP images are allowed",
      });
    }

    // Create folders
    const uploadRoot =
      path.join(
        __dirname,
        "..",
        "uploads"
      );

    const uploadFolder =
      path.join(
        uploadRoot,
        imageType
      );

    await fs.promises.mkdir(
      uploadFolder,
      {
        recursive: true,
      }
    );

    // File extension
    const extension =
      path.extname(
        file.filename
      ) ||
      (
        file.mimetype ===
        "image/png"
          ? ".png"
          : ".jpg"
      );

    // Unique filename
    const fileName =
      `${imageType}_${userId}_${Date.now()}${extension}`;

    const filePath =
      path.join(
        uploadFolder,
        fileName
      );

    // Save file
    await pipeline(
      file.file,
      fs.createWriteStream(
        filePath
      )
    );

    // Database path
    const imagePath =
      `/uploads/${imageType}/${fileName}`;

    // Update database
    const updateData = {};

    if (imageType === "profile") {
      updateData.profile_pic =
        imagePath;
    } else {
      updateData.cover_pic =
        imagePath;
    }

    updateData.updated_on =
      moment().unix();

    const updated =
      await Users.updateUser(
        userId,
        updateData
      );

    if (!updated) {
      // Remove uploaded file if DB update fails
      try {
        await fs.promises.unlink(
          filePath
        );
      } catch (deleteError) {
        console.error(
          "Could not remove file:",
          deleteError
        );
      }

      return reply.send({
        status: 0,
        message:
          "Image uploaded but database update failed",
      });
    }

    const imageUrl =
      `${req.protocol}://${req.hostname}${imagePath}`;

    console.log(
      "Image uploaded:",
      imageUrl
    );

    return reply.send({
      status: 1,
      message:
        imageType === "profile"
          ? "Profile picture uploaded successfully"
          : "Cover picture uploaded successfully",

      user_id: userId,
      type: imageType,

      image_path: imagePath,
      image_url: imageUrl,
    });

  } catch (error) {
    console.error(
      "Error uploadUserImage:",
      error
    );

    return reply.status(500).send({
      status: 0,
      message:
        "Failed to upload image",
      error:
        error.message,
    });
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createUser,
  fetchAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  searchUsers,
  uploadUserImage,
};
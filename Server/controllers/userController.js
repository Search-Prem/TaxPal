import User from "../models/User.js";

// Get logged-in user's profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Update logged-in user's profile
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      {
        new: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (err) {
    console.error("Profile update error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Update notification preferences
export const updateNotifications = async (req, res) => {
  try {
    const {
      email,
      sms,
      push,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        notifications: {
          email,
          sms,
          push,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Notification settings updated successfully",
      notifications: updatedUser.notifications,
    });
  } catch (err) {
    console.error("Notification update error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};
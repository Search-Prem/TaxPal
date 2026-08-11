import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Temporary OTP storage
const otpStore = {};

// Register
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      country,
      income,
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !country || !income) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hash,
      country,
      income,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    console.error("Register error:", err.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const ok = await bcrypt.compare(
      password,
      user.password
    );

    if (!ok) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
    });
  } catch (err) {
    console.error("Login error:", err.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    otpStore[email] = otp;

    // Send OTP to email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}`,
    });

    res.json({
      message: "OTP sent to email",
    });
  } catch (err) {
    console.error("Forgot password error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  const {
    email,
    otp,
    password,
  } = req.body;

  try {
    if (
      !otpStore[email] ||
      otpStore[email] !== otp
    ) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const hashed = await bcrypt.hash(
      password,
      10
    );

    await User.findOneAndUpdate(
      { email },
      { password: hashed }
    );

    delete otpStore[email];

    res.json({
      message: "Password reset successful",
    });
  } catch (err) {
    console.error("Reset password error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};
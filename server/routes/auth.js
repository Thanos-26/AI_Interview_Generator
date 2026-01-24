import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const router = express.Router();

// Helper function to generate JWT with user data
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      name: user.name,
      picture: user.picture,
      provider: user.provider
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1️⃣ Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3️⃣ Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4️⃣ Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      provider: 'local'
    });

    await newUser.save();

    // 5️⃣ Send success response
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3️⃣ Check if user is OAuth-only (no password)
    if (!user.password) {
      return res.status(400).json({ 
        message: `This account uses ${user.provider} login. Please sign in with ${user.provider}.` 
      });
    }

    // 4️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 5️⃣ Generate JWT
    const token = generateToken(user);

    // 6️⃣ Send response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        provider: user.provider
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==========================================
// GOOGLE OAUTH
// ==========================================
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    // Decode the JWT from Google (the credential is a JWT)
    // For production, you should verify this with Google's public keys
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const googleUser = JSON.parse(jsonPayload);
    const { sub: googleId, email, name, picture } = googleUser;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user with Google info if needed
      if (user.provider === 'local') {
        user.provider = 'google';
        user.providerId = googleId;
        user.picture = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name,
        email,
        provider: 'google',
        providerId: googleId,
        picture
      });
      await user.save();
    }

    // Generate JWT
    const token = generateToken(user);

    res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        provider: user.provider
      }
    });

  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
});

// ==========================================
// GITHUB OAUTH
// ==========================================
router.post("/github", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "GitHub code is required" });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ message: tokenData.error_description || "GitHub authentication failed" });
    }

    const accessToken = tokenData.access_token;

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const githubUser = await userResponse.json();

    // Get user email (might be private)
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      const emails = await emailResponse.json();
      const primaryEmail = emails.find(e => e.primary);
      email = primaryEmail ? primaryEmail.email : emails[0]?.email;
    }

    if (!email) {
      return res.status(400).json({ message: "Could not get email from GitHub" });
    }

    const { id: githubId, name, login, avatar_url } = githubUser;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user with GitHub info if needed
      if (user.provider === 'local') {
        user.provider = 'github';
        user.providerId = String(githubId);
        user.picture = avatar_url;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name: name || login,
        email,
        provider: 'github',
        providerId: String(githubId),
        picture: avatar_url
      });
      await user.save();
    }

    // Generate JWT
    const token = generateToken(user);

    res.status(200).json({
      message: "GitHub login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        provider: user.provider
      }
    });

  } catch (error) {
    console.error("GitHub auth error:", error);
    res.status(500).json({ message: "GitHub authentication failed" });
  }
});


export default router;

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req: any, res: any) => {
  try {
    const { username, password, role, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    if (role === "admin") {
      return res.status(400).json({ message: "Invalid role" });  // not allowed to create admin role through the portal
    }
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      role,
    });
    res
      .status(201)
      .json({ id: user.id, username: user.username, success: 201 });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message, success: false });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    console.log("userhere:::", user);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    res
    .status(201)
    .json({
      token,
      loggedinUserName: user.username,
      id: user.id,
      role: user.role,
      status: 200,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

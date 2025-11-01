import { verifyJwtToken } from "../utils.js";

export const Usermiddleware = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(403).json({ success: false, message: "Token missing" });
    }
    const verifiedToken = verifyJwtToken(token);
    if (!verifiedToken) {
      return res.status(403).json({ success: false, message: "Unauthorized aceess" });
    }
    req.user = verifiedToken;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: `invalid or expired token : more details=${error}`,
    });
  }
};

export const Adminmiddleware = (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access only" });
    }
    next();
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: `invalid or expired token : more details=${error}` });
  }
};

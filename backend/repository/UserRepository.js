import { User } from "../core/schema.js";
import { generateRandomString } from "../utils.js";

class UserRepo {
  constructor() {
    this.model = User;
  }

  async createUser(email, password, role) {
    try {
      if (!email && !password && !role) {
        throw new Error("Invalid Input");
      }
      const username = email.split("@")[0] + generateRandomString();
      if (!username) {
        throw new Error("Username doesnot exists");
      }
      const newUser = new this.model({ username, email, password, role });
      await newUser.save();
      return newUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getUserbyId(userId) {
    try {
      if (!userId) {
        throw new Error("userId is missing");
      }
      const userData = await this.model.findById(userId).select("-password -__v");
      if (!userData) {
        throw new Error("User Id missing");
      }
      return userData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getUserbyEmail(email) {
    try {
      if (!email) {
        throw new Error("userEmail is missing");
      }
      const userData = await this.model.findOne({ email: email });
      return userData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export const userRepo = new UserRepo();

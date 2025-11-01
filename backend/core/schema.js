import mongoose from "mongoose";

const Schema = mongoose.Schema;
const objectID = mongoose.Types.ObjectId;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    creator: {
      type: objectID,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const PurchaseSchema = new Schema(
  {
    userId: {
      type: objectID,
      required: true,
    },

    courseId: {
      type: objectID,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const PaymentSchema = new Schema(
  {
    userId: {
      type: objectID,
      required: true,
    },

    courseId: {
      type: objectID,
      required: true,
    },

    currency: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: ["esewa", "khalti", "paypal", "card", "stripe"],
      required: true,
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", UserSchema);
export const Course = mongoose.model("Course", CourseSchema);
export const Purchase = mongoose.model("Purchase", PurchaseSchema);
export const Payment = mongoose.model("Payment", PaymentSchema);

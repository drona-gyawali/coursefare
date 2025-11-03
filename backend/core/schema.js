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
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const CourseContentSchema = new Schema(
  {
    courseId: {
      type: objectID,
      ref: "Course",
      required: true,
    },

    section: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    contentType: {
      type: String,
      enum: ["pdf", "video", "quiz", "assigment"],
    },

    fileUrl: {
      type: String,
    },

    description: {
      type: String,
    },

    order: {
      type: Number,
      default: 1,
    },

    isPreview: {
      type: Boolean,
      default: false,
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
      ref: "User",
      required: true,
    },

    courseId: {
      type: objectID,
      ref: "Course",
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
      ref: "User",
      required: true,
    },

    courseId: {
      type: objectID,
      ref: "Course",
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
export const CourseContent = mongoose.model("CourseContent", CourseContentSchema);
export const Purchase = mongoose.model("Purchase", PurchaseSchema);
export const Payment = mongoose.model("Payment", PaymentSchema);

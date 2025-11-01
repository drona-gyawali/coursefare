import { Payment } from "../core/schema.js";

class PaymentRepository {
  constructor() {
    this.model = Payment;
  }

  async CreatePayment(
    userId,
    courseId,
    currency,
    amount,
    method,
    transactionId,
    status,
    metadata = "",
  ) {
    try {
      const createPayment = this.model({
        userId,
        courseId,
        currency,
        amount,
        method,
        transactionId,
        status,
        metadata,
      });
      await createPayment.save();
      return createPayment;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async UpdatePayment(transactionId) {
    try {
      const paymentUpdated = await this.model.findOneAndUpdate(
        { transactionId: transactionId },
        { status: "success" },
      );
      if (!paymentUpdated) throw new Error("Unable to update the payment");
      return paymentUpdated;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async hasUserPaidForCourse(userId, courseId) {
    if (!userId || !courseId) return false;

    const record = await this.model.findOne({ userId, courseId });
    if (!record) return false;

    return record.status === "success";
  }
}

export const paymentRepo = new PaymentRepository();

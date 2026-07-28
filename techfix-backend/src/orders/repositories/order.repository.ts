import Order, { IOrderDocument } from "../models/order.model";
import OrderStatusLog, { IOrderStatusLogDocument } from "../models/orderStatusLog.model";
import { OrderStatusType } from "../../config/constants";

/**
 * Order Repository
 * The only layer that talks to MongoDB for orders and their status log.
 */
export class OrderRepository {
  async create(data: Partial<IOrderDocument>): Promise<IOrderDocument> {
    const order = new Order(data);
    return order.save();
  }

  async findById(id: string): Promise<IOrderDocument | null> {
    return Order.findById(id).exec();
  }

  /** The logged-in customer's own orders, newest first. */
  async findByUser(userId: string): Promise<IOrderDocument[]> {
    return Order.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }

  async updateStatus(id: string, status: OrderStatusType): Promise<IOrderDocument | null> {
    return Order.findByIdAndUpdate(id, { status }, { returnDocument: "after" }).exec();
  }

  async referenceIdExists(referenceId: string): Promise<boolean> {
    const count = await Order.countDocuments({ referenceId });
    return count > 0;
  }

  async createStatusLog(data: {
    order: string;
    stage: OrderStatusType;
    note?: string;
    updatedBy: string;
  }): Promise<IOrderStatusLogDocument> {
    const log = new OrderStatusLog(data);
    return log.save();
  }

  async findStatusLogsByOrder(orderId: string): Promise<IOrderStatusLogDocument[]> {
    return OrderStatusLog.find({ order: orderId })
      .populate("updatedBy", "name")
      .sort({ timestamp: -1 })
      .exec();
  }
}

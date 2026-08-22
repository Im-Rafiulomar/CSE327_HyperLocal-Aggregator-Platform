import { BaseRepository } from "./BaseRepository.js";
import { Order } from "../models/Order.js";

export class OrderRepository extends BaseRepository {
  constructor(model = Order) {
    super(model);
  }

  latestForUser(userId) {
    return this.model.findOne({ user: userId }).sort({ createdAt: -1 }).lean();
  }

  forUser(userId) {
    return this.model.find({ user: userId }).lean();
  }
}

export const orderRepository = new OrderRepository();

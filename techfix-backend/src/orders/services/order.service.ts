import { OrderRepository } from "../repositories/order.repository";
import { ProductRepository } from "../../products/repositories/product.repository";
import { CreateOrderDto, UpdateOrderStatusDto } from "../dtos/order.dto";
import { OrderStatus, OrderStatusType, UserRole } from "../../config/constants";
import { NotFoundError } from "../../errors/NotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import type { IOrderDocument, IOrderItem } from "../models/order.model";

const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_FEE = 8;

function generateReferenceId(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${stamp}-${digits}`;
}

/**
 * Order Service
 *
 * Turns a cart into a confirmed order. The client sends product ids and
 * quantities only — every price, fee and total is recomputed here from the
 * stored products, so a tampered request cannot change what is charged.
 */
export class OrderService {
  private orderRepository: OrderRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.productRepository = new ProductRepository();
  }

  async create(userId: string, dto: CreateOrderDto) {
    const items: IOrderItem[] = [];
    let subtotal = 0;

    // Validate and price every line before touching stock, so a failure
    // partway down the cart can't leave some products already decremented.
    for (const line of dto.items) {
      const product = await this.productRepository.findById(line.product);
      if (!product) {
        throw new NotFoundError(`Product ${line.product}`);
      }
      if (product.stock < line.quantity) {
        throw new ValidationError(
          `${product.title} only has ${product.stock} left in stock`
        );
      }

      subtotal += product.price * line.quantity;
      items.push({
        product: product._id,
        title: product.title,
        brand: product.brand,
        unitPrice: product.price,
        quantity: line.quantity,
        image: product.images[0],
        sellerName:
          (product.seller as unknown as { name?: string })?.name ?? "TechFix Seller",
      });
    }

    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shippingFee;

    // Reserve stock. The repository guard is atomic, so a race for the last
    // unit fails here rather than overselling.
    for (const line of dto.items) {
      const reserved = await this.productRepository.decrementStock(
        line.product,
        line.quantity
      );
      if (!reserved) {
        throw new ValidationError(
          "One of your items just sold out — please review your cart"
        );
      }
    }

    let referenceId = generateReferenceId();
    while (await this.orderRepository.referenceIdExists(referenceId)) {
      referenceId = generateReferenceId();
    }

    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 4);
    estimatedDeliveryDate.setHours(17, 0, 0, 0);

    const order = await this.orderRepository.create({
      referenceId,
      user: userId,
      items,
      shippingAddress: dto.shippingAddress,
      paymentMethod: dto.paymentMethod,
      subtotal,
      shippingFee,
      total,
      estimatedDeliveryDate,
    } as unknown as Partial<IOrderDocument>);

    // Seed the timeline so tracking has a first entry from the moment the
    // order exists, rather than appearing empty until a seller acts.
    await this.orderRepository.createStatusLog({
      order: order._id.toString(),
      stage: OrderStatus.PLACED,
      note: "Order received",
      updatedBy: userId,
    });

    return { order };
  }

  /**
   * An order is private: only the customer who placed it or an admin may
   * read it. Derived from the stored document, never from the request.
   */
  private assertCanView(order: IOrderDocument, requesterId: string, isAdmin: boolean) {
    if (isAdmin) return;
    if (order.user.toString() !== requesterId) {
      throw new ForbiddenError("You do not have access to this order");
    }
  }

  async getById(requesterId: string, isAdmin: boolean, id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError("Order");
    }
    this.assertCanView(order, requesterId, isAdmin);
    return { order };
  }

  /** The logged-in customer's own orders — powers "Order History". */
  async getMine(userId: string) {
    const items = await this.orderRepository.findByUser(userId);
    return { items };
  }

  async getStatusHistory(requesterId: string, isAdmin: boolean, orderId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order");
    }
    this.assertCanView(order, requesterId, isAdmin);

    const logs = await this.orderRepository.findStatusLogsByOrder(orderId);
    return { logs };
  }

  /**
   * Advances an order's fulfilment stage. Seller or admin only — enforced
   * at the route. A per-seller ownership check isn't possible yet because
   * an order may span several sellers; splitting orders per seller is the
   * natural next increment.
   */
  async updateStatus(
    requesterId: string,
    role: string,
    orderId: string,
    dto: UpdateOrderStatusDto
  ) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order");
    }
    if (role !== UserRole.SELLER && role !== UserRole.ADMIN) {
      throw new ForbiddenError("Only sellers or admins can update an order");
    }

    await this.orderRepository.createStatusLog({
      order: orderId,
      stage: dto.stage as OrderStatusType,
      note: dto.note,
      updatedBy: requesterId,
    });

    const updated = await this.orderRepository.updateStatus(
      orderId,
      dto.stage as OrderStatusType
    );

    return { order: updated };
  }
}

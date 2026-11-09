import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Order extends Model {
  declare id: number;
  declare orderNumber: string;
  declare userId: number;
  declare status: string;
  declare subtotal: number;
  declare discountAmount: number;
  declare totalAmount: number;
  declare paymentMethod: string;
  declare paymentStatus: string;
  declare paymentConfirmedAt: Date | null;
  declare cancelledAt: Date | null;
  declare paymentReference: string | null;
  declare checkoutUrl: string | null;
  declare paymentId: string | null;
  declare paymentExpiresAt: Date | null;
  declare createdAt: Date;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderNumber: { type: DataTypes.STRING(50), allowNull: false, unique: true, field: "order_number" },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "pending" },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "discount_amount",
    },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "total_amount" },
    paymentMethod: { type: DataTypes.STRING(50), allowNull: false, field: "payment_method" },
    paymentStatus: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "pending",
      field: "payment_status",
    },
    paymentConfirmedAt: { type: DataTypes.DATE, allowNull: true, field: "payment_confirmed_at" },
    cancelledAt: { type: DataTypes.DATE, allowNull: true, field: "cancelled_at" },
    paymentReference: { type: DataTypes.UUID, allowNull: true, unique: true, field: "payment_reference" },
    checkoutUrl: { type: DataTypes.TEXT, allowNull: true, field: "checkout_url" },
    paymentId: { type: DataTypes.STRING(100), allowNull: true, unique: true, field: "payment_id" },
    paymentExpiresAt: { type: DataTypes.DATE, allowNull: true, field: "payment_expires_at" },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: "created_at" },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: false,
    indexes: [
      { fields: ["order_number"] },
      { fields: ["user_id"] },
      { fields: ["status"] },
      { fields: ["created_at"] },
    ],
  },
);

export default Order;

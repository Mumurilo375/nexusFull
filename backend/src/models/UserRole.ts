import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class UserRole extends Model {
  declare userId: number;
  declare roleId: number;
}

UserRole.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: "user_id",
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: "role_id",
    },
  },
  {
    sequelize,
    tableName: "user_roles",
    timestamps: false,
  },
);

export default UserRole;

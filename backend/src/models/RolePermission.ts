import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class RolePermission extends Model {
  declare roleId: number;
  declare permissionId: number;
}

RolePermission.init(
  {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: "role_id",
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: "permission_id",
    },
  },
  {
    sequelize,
    tableName: "role_permissions",
    timestamps: false,
  },
);

export default RolePermission;

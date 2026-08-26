import Permission from "../models/Permission";
import Role from "../models/Role";
import UserRole from "../models/UserRole";
import Users from "../models/Users";
import { AppError } from "../utils/app-error";

export const PERMISSIONS = {
  ADMIN_ACCESS: "admin.access",
  USERS_READ: "users.read",
  CATALOG_MANAGE: "catalog.manage",
  INVENTORY_MANAGE: "inventory.manage",
  ORDERS_READ: "orders.read",
  PRICING_READ: "pricing.read",
  PROMOTIONS_MANAGE: "promotions.manage",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

type RoleAccess = {
  name: string;
  permissions?: Array<{ name: string }>;
};

type UserWithRoles = Users & {
  roles?: RoleAccess[];
};

export type UserAccess = {
  roles: string[];
  permissions: string[];
};

export const USER_ACCESS_INCLUDE = [
  {
    model: Role,
    as: "roles",
    attributes: ["name"],
    through: { attributes: [] },
    include: [
      {
        model: Permission,
        as: "permissions",
        attributes: ["name"],
        through: { attributes: [] },
      },
    ],
  },
];

export function getAccessFromUser(user: Users): UserAccess {
  const includedRoles =
    typeof user.get === "function" ? user.get("roles") : undefined;
  const roleRecords = ((user as UserWithRoles).roles ?? includedRoles ?? []) as RoleAccess[];
  const roles = roleRecords.map((role) => role.name);
  const permissions = new Set(
    roleRecords.flatMap((role) =>
      (role.permissions ?? []).map((permission) => permission.name),
    ),
  );

  return { roles, permissions: [...permissions] };
}

export function serializeUserWithAccess(user: Users) {
  const serialized = typeof user.toJSON === "function" ? user.toJSON() : user;
  const { passwordHash, roles: _roleRecords, ...publicUser } = serialized;
  return { ...publicUser, ...getAccessFromUser(user) };
}

export async function assignDefaultRole(userId: number): Promise<void> {
  const customerRole = await Role.findOne({ where: { name: "customer" }, attributes: ["id"] });

  if (!customerRole) {
    throw new AppError(500, "RBAC_CONFIG_ERROR", "A role padrão de usuário não está configurada");
  }

  await UserRole.create({ userId, roleId: customerRole.id });
}

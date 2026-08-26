"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable("roles", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
        name: { type: Sequelize.STRING(50), allowNull: false, unique: true },
        description: { type: Sequelize.STRING(255), allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      }, { transaction });

      await queryInterface.createTable("permissions", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
        name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
        description: { type: Sequelize.STRING(255), allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      }, { transaction });

      await queryInterface.createTable("user_roles", {
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        role_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: { model: "roles", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
      }, { transaction });

      await queryInterface.createTable("role_permissions", {
        role_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: { model: "roles", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        permission_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: { model: "permissions", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
      }, { transaction });

      await queryInterface.addIndex("user_roles", ["role_id"], { transaction });
      await queryInterface.addIndex("role_permissions", ["permission_id"], { transaction });

      const now = new Date();
      await queryInterface.bulkInsert("roles", [
        { id: 1, name: "customer", description: "Cliente autenticado da loja", created_at: now, updated_at: now },
        { id: 2, name: "admin", description: "Administrador com acesso completo ao painel", created_at: now, updated_at: now },
      ], { transaction });

      const permissions = [
        [1, "admin.access", "Acessar o painel administrativo"],
        [2, "users.read", "Consultar usuários"],
        [3, "catalog.manage", "Gerenciar catálogo, categorias e plataformas"],
        [4, "inventory.manage", "Gerenciar estoque de chaves"],
        [5, "orders.read", "Consultar pedidos administrativos"],
        [6, "pricing.read", "Consultar histórico de preços"],
        [7, "promotions.manage", "Gerenciar promoções"],
      ];

      await queryInterface.bulkInsert("permissions", permissions.map(([id, name, description]) => ({
        id,
        name,
        description,
        created_at: now,
        updated_at: now,
      })), { transaction });

      await queryInterface.bulkInsert("role_permissions", permissions.map(([id]) => ({
        role_id: 2,
        permission_id: id,
      })), { transaction });

      await queryInterface.sequelize.query(
        `INSERT INTO user_roles (user_id, role_id)
         SELECT id, CASE WHEN is_admin = TRUE THEN 2 ELSE 1 END
         FROM users`,
        { transaction },
      );

      await queryInterface.sequelize.query(
        "SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT MAX(id) FROM roles))",
        { transaction },
      );
      await queryInterface.sequelize.query(
        "SELECT setval(pg_get_serial_sequence('permissions', 'id'), (SELECT MAX(id) FROM permissions))",
        { transaction },
      );

      await queryInterface.removeColumn("users", "is_admin", { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addColumn("users", "is_admin", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }, { transaction });

      await queryInterface.sequelize.query(
        `UPDATE users
         SET is_admin = TRUE
         WHERE id IN (
           SELECT ur.user_id
           FROM user_roles ur
           INNER JOIN roles r ON r.id = ur.role_id
           WHERE r.name = 'admin'
         )`,
        { transaction },
      );

      await queryInterface.dropTable("role_permissions", { transaction });
      await queryInterface.dropTable("user_roles", { transaction });
      await queryInterface.dropTable("permissions", { transaction });
      await queryInterface.dropTable("roles", { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};

import { UniqueConstraintError, ValidationError } from "sequelize";
import Categories from "../models/Category";
import { invalidateCatalogCache } from "../config/cache";
import Games from "../models/Games";
import { AppError, requireFound } from "../utils/app-error";
import { buildPage, getPaginationOffset } from "../utils/pagination";
import {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from "../validators/category.validator";

async function findCategoryOrFail(id: number): Promise<Categories> {
  return requireFound(await Categories.findByPk(id), "CATEGORY_NOT_FOUND", "Category not found");
}

async function checkDuplicateName(
  name: string,
  excludeId?: number,
): Promise<void> {
  const existing = await Categories.findOne({ where: { name } });

  if (existing && existing.id !== excludeId) {
    throw new AppError(
      409,
      "CATEGORY_ALREADY_EXISTS",
      "Category name is already in use",
    );
  }
}

function normalizeCategoryError(error: unknown): never {
  if (error instanceof UniqueConstraintError) {
    throw new AppError(409, "CATEGORY_ALREADY_EXISTS", "Category name is already in use");
  }
  if (error instanceof ValidationError) {
    throw new AppError(400, "INVALID_CATEGORY_DATA", "Invalid category data");
  }
  throw error;
}

export async function listCategories(query: ListCategoriesQuery) {
  const result = await Categories.findAndCountAll({
    limit: query.limit,
    offset: getPaginationOffset(query.page, query.limit),
    order: [["id", "DESC"]],
  });

  return buildPage(query, result);
}

export async function getCategoryById(id: number) {
  return requireFound(await Categories.findByPk(id, {
    include: [{ model: Games, as: "games", through: { attributes: [] } }],
  }), "CATEGORY_NOT_FOUND", "Category not found");
}

export async function createCategory(input: CreateCategoryInput) {
  try {
    await checkDuplicateName(input.name);
    const category = await Categories.create({ ...input });
    await invalidateCatalogCache();
    return category;
  } catch (error) {
    normalizeCategoryError(error);
  }
}

export async function updateCategory(id: number, input: UpdateCategoryInput) {
  try {
    const category = await findCategoryOrFail(id);
    await checkDuplicateName(input.name, id);
    await category.update(input);
    await invalidateCatalogCache();
    return category;
  } catch (error) {
    normalizeCategoryError(error);
  }
}

export async function deleteCategory(id: number) {
  const category = await findCategoryOrFail(id);
  await category.destroy();
  await invalidateCatalogCache();
}

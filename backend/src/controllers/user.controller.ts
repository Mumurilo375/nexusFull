import { Request, Response } from "express";
import { createUser, deleteUser, getUserById, listUsers, updateUser } from "../services/user.service";
import { AppError } from "../utils/app-error";
import { withTemporaryUploads } from "../utils/with-temporary-uploads";
import { PERMISSIONS } from "../services/rbac.service";
import {
  validateCreateUserInput,
  validateIdParam,
  validateListUsersQuery,
  validateUpdateUserInput,
} from "../validators/user.validator";

function getAuthenticatedUserId(req: Request): number {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "User not authenticated");
  }

  return req.user.id;
}

function ensureOwnerOrAdmin(req: Request, targetUserId: number): void {
  const authUser = req.user;

  if (!authUser) {
    throw new AppError(401, "UNAUTHORIZED", "User not authenticated");
  }

  if (
    authUser.id !== targetUserId &&
    !authUser.permissions.includes(PERMISSIONS.USERS_READ)
  ) {
    throw new AppError(403, "FORBIDDEN", "You can only view your own account");
  }
}

class UserController {
  static async list(req: Request, res: Response): Promise<void> {
    const paginationFilters = validateListUsersQuery(req.query);
    const usersPage = await listUsers(paginationFilters);
    res.status(200).json(usersPage);
  }

  static async get(req: Request, res: Response): Promise<void> {
    const userId = validateIdParam(req.params.id as string);
    ensureOwnerOrAdmin(req, userId);
    const user = await getUserById(userId);
    res.status(200).json(user);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const createdUser = await withTemporaryUploads([req.file], async () => {
      const newUserData = validateCreateUserInput(req.body);
      return createUser(newUserData, req.file);
    });
    res.status(201).json(createdUser);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const updatedUser = await withTemporaryUploads([req.file], async () => {
      const targetUserId = validateIdParam(req.params.id as string);
      const updatedUserData = validateUpdateUserInput(req.body);
      const authenticatedUserId = getAuthenticatedUserId(req);

      return updateUser(
        targetUserId,
        authenticatedUserId,
        updatedUserData,
        req.file,
      );
    });
    res.status(200).json(updatedUser);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const targetUserId = validateIdParam(req.params.id as string);
    const authenticatedUserId = getAuthenticatedUserId(req);

    await deleteUser(targetUserId, authenticatedUserId);
    res.status(204).send();
  }
}

export default UserController;

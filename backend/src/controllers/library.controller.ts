import { Request, Response } from "express";
import { listUserLibraryKeys } from "../services/library.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import { validateListLibraryQuery } from "../validators/library.validator";

class LibraryController {
  static async list(req: Request, res: Response): Promise<void> {
    const query = validateListLibraryQuery(req.query);
    const library = await listUserLibraryKeys(requireAuthenticatedUserId(req), query);
    res.status(200).json(library);
  }
}

export default LibraryController;

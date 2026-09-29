import { Request, Response } from "express";
import { loginUser } from "../services/auth.service";
import { validateLoginInput } from "../validators/auth.validator";

class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    const loginData = validateLoginInput(req.body);
    const loginResult = await loginUser(loginData);
    res.status(200).json(loginResult);
  }
}

export default AuthController;
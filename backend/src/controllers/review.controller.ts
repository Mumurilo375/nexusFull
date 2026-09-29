import { Request, Response } from "express";
import {
  createReview,
  deleteReview,
  getReviewById,
  listReviews,
  updateReview,
} from "../services/review.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import {
  validateCreateReviewInput,
  validateListReviewsQuery,
  validateReviewIdParam,
  validateUpdateReviewInput,
} from "../validators/review.validator";

class ReviewController {
  static async list(req: Request, res: Response): Promise<void> {
    const query = validateListReviewsQuery(req.query);
    const reviews = await listReviews(query);
    res.status(200).json(reviews);
  }

  static async get(req: Request, res: Response): Promise<void> {
    const reviewId = validateReviewIdParam(req.params.id as string);
    const review = await getReviewById(reviewId);
    res.status(200).json(review);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const input = validateCreateReviewInput(req.body);
    const review = await createReview(requireAuthenticatedUserId(req), input);
    res.status(201).json(review);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const reviewId = validateReviewIdParam(req.params.id as string);
    const input = validateUpdateReviewInput(req.body);
    const review = await updateReview(requireAuthenticatedUserId(req), reviewId, input);
    res.status(200).json(review);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const reviewId = validateReviewIdParam(req.params.id as string);
    await deleteReview(requireAuthenticatedUserId(req), reviewId);
    res.status(204).send();
  }
}

export default ReviewController;

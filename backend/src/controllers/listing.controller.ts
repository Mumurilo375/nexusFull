import { Request, Response } from "express";
import {
  createListing,
  deleteListing,
  getListingById,
  getListingDetailsById,
  getListingStockById,
  listListings,
  updateListing,
} from "../services/listing.service";
import {
  validateCreateListingInput,
  validateListingIdParam,
  validateListListingsQuery,
  validateUpdateListingInput,
} from "../validators/listing.validator";

class ListingController {
  static async list(req: Request, res: Response): Promise<void> {
    const query = validateListListingsQuery(req.query);
    const listings = await listListings(query);
    res.status(200).json(listings);
  }

  static async get(req: Request, res: Response): Promise<void> {
    const listingId = validateListingIdParam(req.params.id as string);
    const listing = await getListingById(listingId);
    res.status(200).json(listing);
  }

  static async stock(req: Request, res: Response): Promise<void> {
    const listingId = validateListingIdParam(req.params.id as string);
    const stock = await getListingStockById(listingId);
    res.status(200).json(stock);
  }

  static async details(req: Request, res: Response): Promise<void> {
    const listingId = validateListingIdParam(req.params.id as string);
    const listingDetails = await getListingDetailsById(listingId);
    res.status(200).json(listingDetails);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const input = validateCreateListingInput(req.body);
    const listing = await createListing(input, req.user?.id);
    res.status(201).json(listing);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const listingId = validateListingIdParam(req.params.id as string);
    const input = validateUpdateListingInput(req.body);
    const listing = await updateListing(listingId, input, req.user?.id);
    res.status(200).json(listing);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const listingId = validateListingIdParam(req.params.id as string);
    await deleteListing(listingId);
    res.status(204).send();
  }
}

export default ListingController;

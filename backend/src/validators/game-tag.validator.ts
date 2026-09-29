import {
  parseOptionalIdQuery,
  readRequestBody,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface CreateGameTagInput {
  gameId: number;
  tagId: number;
}

export interface ListGameTagsQuery {
  page: number;
  limit: number;
  gameId?: number;
}

export interface GameTagParams {
  gameId: number;
  tagId: number;
}

export function validateCreateGameTagInput(
  body: InputValue | null | undefined,
): CreateGameTagInput {
  const requestBody = readRequestBody(body);

  return {
    gameId: validatePositiveIdParam(String(requestBody.gameId ?? "")),
    tagId: validatePositiveIdParam(String(requestBody.tagId ?? "")),
  };
}

export function validateGameTagParams(gameId: string, tagId: string): GameTagParams {
  return {
    gameId: validatePositiveIdParam(gameId),
    tagId: validatePositiveIdParam(tagId),
  };
}

export function validateListGameTagsQuery(
  query: InputValue | null | undefined,
): ListGameTagsQuery {
  return parseOptionalIdQuery(query, "gameId");
}

import type { GeminiClient } from "../geminiClient/geminiClient";
import type { PostScrapeType } from "../types/facebookTypes";

export const FACEBOOK_RENTAL_AMENITIES = [
  "gym",
  "ac",
  "lift",
  "parking",
  "swimming_pool",
] as const;

export const FACEBOOK_RENTAL_RESTRICTIONS = [
  "no_alcohol",
  "no_smoking",
  "no_nonveg",
] as const;

export type FacebookRentalAmenity = (typeof FACEBOOK_RENTAL_AMENITIES)[number];
export type FacebookRentalRestriction =
  (typeof FACEBOOK_RENTAL_RESTRICTIONS)[number];

export type FacebookRentalClassification = {
  isValidPost: boolean;
  genderPreference: "male" | "female" | "both" | null;
  amenities: FacebookRentalAmenity[];
  roomsAvailable: number | null;
  bhk: "1" | "2" | "3" | "entire_flat" | null;
  moveInDate: string | null;
  furnishing: "fully_furnished" | "semi_furnished" | "unfurnished" | null;
  restrictions: FacebookRentalRestriction[];
};

type GeminiRentalClassificationResponse = {
  is_valid_post?: boolean;
  isValidPost?: boolean;
  gender_preference?: FacebookRentalClassification["genderPreference"];
  genderPreference?: FacebookRentalClassification["genderPreference"];
  amenities?: string[];
  rooms_available?: number | null;
  roomsAvailable?: number | null;
  bhk?: FacebookRentalClassification["bhk"];
  move_in_date?: string | null;
  moveInDate?: string | null;
  furnishing?: FacebookRentalClassification["furnishing"];
  restrictions?: string[];
};

export type FacebookPostClassifierClient = Pick<GeminiClient, "requestJson">;

export class FacebookPostClassifier {
  constructor(private readonly geminiClient: FacebookPostClassifierClient) {}

  async classify(post: PostScrapeType): Promise<FacebookRentalClassification> {
    const response =
      await this.geminiClient.requestJson<GeminiRentalClassificationResponse>(
        this.buildPrompt(post)
      );

    return normalizeGeminiResponse(response);
  }

  private buildPrompt(post: PostScrapeType): string {
    return `
Classify this Facebook post for a Bangalore rental-property pipeline.

Return only JSON. Do not include markdown, comments, or extra text.

A valid post is specifically about renting, subletting, or finding a tenant/flatmate for a residential apartment/flat/room.
Invalid posts include property sale posts, broker ads without a rental/flatmate offer, generic questions, memes, services, spam, and unrelated real estate content.

Use this exact JSON shape:
{
  "is_valid_post": boolean,
  "gender_preference": "male" | "female" | "both" | null,
  "amenities": ("gym" | "ac" | "lift" | "parking" | "swimming_pool")[],
  "rooms_available": number | null,
  "bhk": "1" | "2" | "3" | "entire_flat" | null,
  "move_in_date": string | null,
  "furnishing": "fully_furnished" | "semi_furnished" | "unfurnished" | null,
  "restrictions": ("no_alcohol" | "no_smoking" | "no_nonveg")[]
}

If "is_valid_post" is false, set every other field to null or [].
If a valid post does not mention a field clearly, use null or [].

Post text:
${JSON.stringify(post.postTextContent)}

Post metadata:
${JSON.stringify({
  postId: post.postId,
  groupName: post.groupName,
  datePosted: post.datePosted,
  mediaCount: post.mediaUrls.length,
})}
`;
  }
}

function normalizeGeminiResponse(
  response: GeminiRentalClassificationResponse
): FacebookRentalClassification {
  if (typeof response !== "object" || response === null) {
    throw new Error("Gemini classification response must be a JSON object");
  }

  const isValidPost = response.is_valid_post ?? response.isValidPost;

  if (typeof isValidPost !== "boolean") {
    throw new Error("Gemini classification response is missing is_valid_post");
  }

  if (!isValidPost) {
    return emptyInvalidClassification();
  }

  return {
    isValidPost,
    genderPreference: normalizeEnum(
      response.gender_preference ?? response.genderPreference,
      ["male", "female", "both"]
    ),
    amenities: normalizeEnumArray(
      response.amenities,
      FACEBOOK_RENTAL_AMENITIES
    ),
    roomsAvailable: normalizePositiveInteger(
      response.rooms_available ?? response.roomsAvailable
    ),
    bhk: normalizeEnum(response.bhk, ["1", "2", "3", "entire_flat"]),
    moveInDate: normalizeString(response.move_in_date ?? response.moveInDate),
    furnishing: normalizeEnum(response.furnishing, [
      "fully_furnished",
      "semi_furnished",
      "unfurnished",
    ]),
    restrictions: normalizeEnumArray(
      response.restrictions,
      FACEBOOK_RENTAL_RESTRICTIONS
    ),
  };
}

function emptyInvalidClassification(): FacebookRentalClassification {
  return {
    isValidPost: false,
    genderPreference: null,
    amenities: [],
    roomsAvailable: null,
    bhk: null,
    moveInDate: null,
    furnishing: null,
    restrictions: [],
  };
}

function normalizeEnum<T extends string>(
  value: unknown,
  allowed: readonly T[]
): T | null {
  if (typeof value !== "string") return null;
  return allowed.includes(value as T) ? (value as T) : null;
}

function normalizeEnumArray<T extends string>(
  values: unknown,
  allowed: readonly T[]
): T[] {
  if (!Array.isArray(values)) return [];
  return [
    ...new Set(
      values.flatMap((value) => {
        const normalized = normalizeEnum(value, allowed);
        return normalized ? [normalized] : [];
      })
    ),
  ];
}

function normalizePositiveInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    return null;
  }
  return value;
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

import { z } from 'zod';
import { CoordinatesSchema } from './wizard';

export const AddressCandidateSchema = z.object({
  address: z.string(),
  coordinates: CoordinatesSchema,
  confidence: z.number().min(0).max(1),
  source: z.enum(['nominatim', 'photon', 'google']),
  boundingBox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  components: z.object({
    street: z.string().optional(),
    houseNumber: z.string().optional(),
    postcode: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export const GeocodingRequestSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(20).default(10),
  countryCode: z.string().default('DE'),
  bounds: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
});

export const GeocodingResponseSchema = z.object({
  candidates: z.array(AddressCandidateSchema),
  query: z.string(),
  executionTime: z.number(),
});

export type AddressCandidate = z.infer<typeof AddressCandidateSchema>;
export type GeocodingRequest = z.infer<typeof GeocodingRequestSchema>;
export type GeocodingResponse = z.infer<typeof GeocodingResponseSchema>;

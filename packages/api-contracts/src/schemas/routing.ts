import { z } from 'zod';
import { CoordinatesSchema } from './wizard';

export const RouteInstructionSchema = z.object({
  text: z.string(),
  distance: z.number(),
  duration: z.number(),
  direction: z.string(),
  type: z.enum(['turn', 'straight', 'roundabout', 'merge', 'fork', 'arrive']),
  coordinates: CoordinatesSchema.optional(),
});

export const RouteSchema = z.object({
  targetId: z.string(),
  distance: z.number(), // in meters
  duration: z.number(), // in seconds
  geometry: z.string(), // encoded polyline
  instructions: z.array(RouteInstructionSchema),
  provider: z.enum(['osrm', 'valhalla', 'graphhopper']),
  confidence: z.number().min(0).max(1),
});

export const RoutingRequestSchema = z.object({
  start: CoordinatesSchema,
  targets: z.array(z.object({
    id: z.string(),
    coordinates: CoordinatesSchema,
  })).min(1).max(50),
  profile: z.enum(['car', 'bike', 'foot']).default('car'),
  alternatives: z.boolean().default(false),
  overview: z.enum(['full', 'simplified', 'false']).default('simplified'),
});

export const RoutingResponseSchema = z.object({
  routes: z.array(RouteSchema),
  executionTime: z.number(),
  provider: z.string(),
});

export type RouteInstruction = z.infer<typeof RouteInstructionSchema>;
export type Route = z.infer<typeof RouteSchema>;
export type RoutingRequest = z.infer<typeof RoutingRequestSchema>;
export type RoutingResponse = z.infer<typeof RoutingResponseSchema>;

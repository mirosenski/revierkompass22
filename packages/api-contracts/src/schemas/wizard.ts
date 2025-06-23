import { z } from 'zod';

export const CoordinatesSchema = z.tuple([z.number(), z.number()]);

export const ContactSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
});

export const GeometrySchema = z.object({
  type: z.string(),
  coordinates: z.array(z.array(z.array(z.number()))),
});

export const PraesidiumSchema = z.object({
  id: z.string(),
  name: z.string(),
  coordinates: CoordinatesSchema,
  childReviere: z.array(z.string()),
  type: z.literal('Präsidium'),
  street: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const RevierSchema = z.object({
  id: z.string(),
  name: z.string(),
  praesidiumId: z.string(),
  coordinates: CoordinatesSchema,
  type: z.enum(['Revier', 'Kriminalpolizei', 'Verkehrspolizei']),
  street: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  geometry: GeometrySchema.optional(),
  contact: ContactSchema.optional(),
  distance: z.number().optional(),
  duration: z.number().optional(),
});

export const WizardStepSchema = z.enum(['start-address', 'target-selection', 'routes-results']);

export const WizardStateSchema = z.object({
  currentStep: WizardStepSchema,
  startAddress: z.object({
    address: z.string(),
    coordinates: CoordinatesSchema,
    confidence: z.number(),
  }).optional(),
  selectedTargets: z.array(z.string()),
  routes: z.array(z.object({
    targetId: z.string(),
    distance: z.number(),
    duration: z.number(),
    geometry: z.string(),
    instructions: z.array(z.object({
      text: z.string(),
      distance: z.number(),
      direction: z.string(),
    })),
  })).optional(),
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Geometry = z.infer<typeof GeometrySchema>;
export type Praesidium = z.infer<typeof PraesidiumSchema>;
export type Revier = z.infer<typeof RevierSchema>;
export type WizardStep = z.infer<typeof WizardStepSchema>;
export type WizardState = z.infer<typeof WizardStateSchema>;

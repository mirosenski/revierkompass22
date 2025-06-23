import { WizardStep, Coordinates } from '../schemas/wizard';

export interface WizardStepChangedEvent {
  type: 'wizard:step-changed';
  payload: {
    from: WizardStep;
    to: WizardStep;
  };
}

export interface AddressSelectedEvent {
  type: 'wizard:address-selected';
  payload: {
    address: string;
    coordinates: Coordinates;
    confidence: number;
  };
}

export interface TargetsSelectedEvent {
  type: 'wizard:targets-selected';
  payload: {
    targetIds: string[];
  };
}

export interface RoutesCalculatedEvent {
  type: 'wizard:routes-calculated';
  payload: {
    totalRoutes: number;
    executionTime: number;
  };
}

export interface MapViewChangedEvent {
  type: 'map:view-changed';
  payload: {
    center: Coordinates;
    zoom: number;
    bounds: [number, number, number, number];
  };
}

export interface ExportStartedEvent {
  type: 'export:started';
  payload: {
    format: 'excel' | 'pdf' | 'json';
  };
}

export interface ExportCompletedEvent {
  type: 'export:completed';
  payload: {
    format: 'excel' | 'pdf' | 'json';
    success: boolean;
    downloadUrl?: string;
  };
}

export type AppEvent = 
  | WizardStepChangedEvent
  | AddressSelectedEvent
  | TargetsSelectedEvent
  | RoutesCalculatedEvent
  | MapViewChangedEvent
  | ExportStartedEvent
  | ExportCompletedEvent;

export interface EventBus {
  emit<T extends AppEvent>(event: T): void;
  on<T extends AppEvent['type']>(
    type: T,
    handler: (event: Extract<AppEvent, { type: T }>) => void
  ): () => void;
  off<T extends AppEvent['type']>(
    type: T,
    handler: (event: Extract<AppEvent, { type: T }>) => void
  ): void;
}

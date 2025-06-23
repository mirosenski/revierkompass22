import { Card } from "@/components/ui/card";
import { EnhancedMapView } from "@/components/ui/EnhancedMapView";
import { Map, Sparkles } from "lucide-react";
import React from "react";
import type { RouteResult, Revier } from "@/stores/wizard";

interface WizardMapPanelProps {
  currentStep: number;
  startCoords?: [number, number];
  selectedReviere: Revier[];
  routeResults: RouteResult[];
  calculationStatus: "idle" | "calculating" | "success" | "error";
}

export function WizardMapPanel({
  currentStep,
  startCoords,
  selectedReviere,
  routeResults,
  calculationStatus,
}: WizardMapPanelProps) {
  // Ziele für die Map
  const destinations = selectedReviere.map((revier) => ({
    id: revier.id,
    name: revier.name,
    coordinates: revier.coordinates,
    address: revier.contact?.address || revier.name,
  }));

  // Dynamischer Header je nach Schritt
  let headerTitle = "Routenübersicht";
  let headerIcon = <Map className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
  let headerInfo = "";
  if (currentStep === 1) {
    headerTitle = "Startadresse auf Karte";
    headerInfo = startCoords ? "Startpunkt gewählt" : "Bitte Adresse eingeben";
  } else if (currentStep === 2) {
    headerTitle = "Zielauswahl auf Karte";
    headerInfo = `${selectedReviere.length} Ziel(e) ausgewählt`;
  } else if (currentStep === 3) {
    headerTitle = "Routenübersicht";
    headerIcon = <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    headerInfo = `${routeResults.length} Routen berechnet`;
  }

  return (
    <Card className="p-0 h-[70vh] min-h-[400px] max-h-[800px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          {headerIcon}
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{headerTitle}</h3>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{headerInfo}</div>
      </div>
      {/* Karte */}
      <div className="flex-1 min-h-[300px]">
        <EnhancedMapView
          startCoordinates={startCoords}
          destinations={destinations}
          routes={currentStep === 3 ? routeResults : []}
          showControls={true}
          style="light"
          className="w-full h-full"
        />
      </div>
      {/* Optional: Ladeanzeige im dritten Schritt */}
      {currentStep === 3 && calculationStatus === "calculating" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
          <span className="text-blue-600 dark:text-blue-300 font-semibold">Routen werden berechnet...</span>
        </div>
      )}
    </Card>
  );
} 
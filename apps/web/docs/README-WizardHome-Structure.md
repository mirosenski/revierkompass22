# WizardHome Verzeichnisstruktur - RevierKompass 2.0

## 📁 **Neue WizardHome-Struktur**

```
apps/web/src/components/wizard/
├── WizardHome/                    # Neues WizardHome Verzeichnis
│   ├── index.ts                   # Export-Index
│   ├── WizardHome.tsx             # Haupt-Wizard-Komponente (umbenannt)
│   ├── WizardProgress.tsx         # Progress Bar Komponente
│   └── steps/                     # Separate Step-Komponenten
│       ├── index.ts               # Export-Index
│       ├── Step1Address.tsx       # Adresseingabe
│       ├── Step2Selection.tsx     # Polizeirevier-Auswahl
│       └── Step3Results.tsx       # Ergebnisanzeige & Export
├── WizardStep1.tsx                # Alte Wizard-Komponenten
├── WizardStep2.tsx                # (bleiben für Kompatibilität)
├── WizardStep3.tsx
└── index.ts                       # Alte Exports
```

## 🎯 **Vorteile der WizardHome-Struktur**

### ✅ **Organisation**
- Alle neuen Wizard-Komponenten in einem Verzeichnis
- Klare Trennung von alten und neuen Komponenten
- Einfache Navigation und Wartung

### ✅ **Modularität**
- Jeder Step ist eine eigene Komponente
- Wiederverwendbare Komponenten
- Saubere Import/Export-Struktur

### ✅ **Skalierbarkeit**
- Neue Steps einfach hinzufügbar
- Erweiterbare Funktionalität
- Flexible Architektur

## 🔧 **Komponenten-Details**

### **WizardHome.tsx** (Hauptkomponente)
```typescript
export function WizardHome() {
  // State Management
  const [currentStep, setCurrentStep] = useState(1);
  const [startAddress, setStartAddress] = useState("");
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  // Event Handlers
  const handleNext = () => setCurrentStep(currentStep + 1);
  const handleBack = () => setCurrentStep(currentStep - 1);
  const handleAddressSelect = (address: string, coordinates: [number, number]) => { ... };
}
```

### **WizardProgress.tsx** (Progress Bar)
```typescript
interface WizardProgressProps {
  currentStep: number;
}

// Features:
// - Animierte Progress-Indikatoren
// - Step-Titel und Beschreibungen
// - Responsive Design
```

### **Step1Address.tsx** (Adresseingabe)
```typescript
interface Step1AddressProps {
  startAddress: string;
  onAddressSelect: (address: string, coordinates: [number, number]) => void;
  onNext: () => void;
}

// Features:
// - AddressAutocomplete Integration
// - Geocoding mit Nominatim
// - Validierung der Eingaben
```

### **Step2Selection.tsx** (Zielauswahl)
```typescript
interface Step2SelectionProps {
  selectedTargets: string[];
  onTargetToggle: (target: string) => void;
  onBack: () => void;
  onNext: () => void;
}

// Features:
// - Multiple Selection
// - Scrollbare Liste
// - Hover-Effekte
```

### **Step3Results.tsx** (Ergebnisse)
```typescript
interface Step3ResultsProps {
  results: Result[];
  loading: boolean;
  onNewSearch: () => void;
}

// Features:
// - Export-Funktionen (Excel, Clipboard)
// - Loading States
// - Sortierte Ergebnisliste
```

## 📦 **Import/Export System**

### **WizardHome Index** (`WizardHome/index.ts`)
```typescript
export { WizardHome } from './WizardHome';
export { WizardProgress } from './WizardProgress';
export { Step1Address, Step2Selection, Step3Results } from './steps';
```

### **Steps Index** (`WizardHome/steps/index.ts`)
```typescript
export { Step1Address } from './Step1Address';
export { Step2Selection } from './Step2Selection';
export { Step3Results } from './Step3Results';
```

### **Verwendung in Homepage**
```typescript
import { WizardHome } from "@/components/wizard/WizardHome";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <WizardHome />
    </main>
  );
}
```

## 🎨 **Design-Features**

### **Glassmorphism**
```css
backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20
```

### **Animationen**
```typescript
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.3 }}
>
```

### **Responsive Layout**
```css
grid grid-cols-1 lg:grid-cols-3 gap-6
```

## 🚀 **Erweiterungsmöglichkeiten**

### **Neue Steps hinzufügen**
1. Neue Step-Komponente in `WizardHome/steps/` erstellen
2. Interface definieren
3. In `WizardHome/steps/index.ts` exportieren
4. In `WizardHome.tsx` integrieren

### **Neue Wizard-Varianten**
```typescript
// Beispiel: WizardAdvanced
export function WizardAdvanced() {
  // Erweiterte Funktionalität
}
```

### **Conditional Steps**
```typescript
{showAdvancedMode && (
  <StepAdvanced
    data={advancedData}
    onSave={handleAdvancedSave}
  />
)}
```

## 🧪 **Testing Strategy**

### **Unit Tests**
```typescript
// WizardHome.test.tsx
describe('WizardHome', () => {
  it('should render all steps correctly', () => {
    // Test implementation
  });
});
```

### **Integration Tests**
```typescript
// Step1Address.test.tsx
describe('Step1Address', () => {
  it('should call onAddressSelect when address is selected', () => {
    // Test implementation
  });
});
```

## 📊 **Performance Optimierungen**

### **Lazy Loading**
```typescript
const WizardHome = lazy(() => import('./WizardHome'));
```

### **Memoization**
```typescript
const MemoizedStep = memo(StepComponent);
```

### **Code Splitting**
```typescript
// Automatisch durch Vite
```

## 🔄 **Migration von ModernWizard**

### **Geänderte Dateien:**
- `ModernWizard.tsx` → `WizardHome/WizardHome.tsx`
- `WizardProgress.tsx` → `WizardHome/WizardProgress.tsx`
- `steps/` → `WizardHome/steps/`

### **Aktualisierte Imports:**
```typescript
// Vorher
import { ModernWizard } from "@/components/wizard/ModernWizard";

// Nachher
import { WizardHome } from "@/components/wizard/WizardHome";
```

---

**Die neue WizardHome-Struktur bietet bessere Organisation und Modularität!** 🎉 
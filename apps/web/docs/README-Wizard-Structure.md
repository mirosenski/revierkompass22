# Wizard Verzeichnisstruktur - RevierKompass 2.0

## 📁 **Neue modulare Struktur**

```
apps/web/src/components/wizard/
├── ModernWizard.tsx          # Haupt-Wizard-Komponente
├── WizardProgress.tsx        # Progress Bar Komponente
└── steps/                    # Separate Step-Komponenten
    ├── index.ts              # Export-Index
    ├── Step1Address.tsx      # Adresseingabe
    ├── Step2Selection.tsx    # Polizeirevier-Auswahl
    └── Step3Results.tsx      # Ergebnisanzeige & Export
```

## 🎯 **Vorteile der modularen Struktur**

### ✅ **Wartbarkeit**
- Jeder Step ist eine eigene Komponente
- Einfache Änderungen ohne andere Steps zu beeinflussen
- Klare Trennung der Verantwortlichkeiten

### ✅ **Wiederverwendbarkeit**
- Steps können in anderen Wizards verwendet werden
- Einfache Imports über `index.ts`
- Konsistente API für alle Steps

### ✅ **Testbarkeit**
- Jeder Step kann einzeln getestet werden
- Isolierte Unit Tests möglich
- Bessere Test-Coverage

### ✅ **Skalierbarkeit**
- Neue Steps einfach hinzufügbar
- Flexible Step-Reihenfolge
- Erweiterbare Funktionalität

## 🔧 **Komponenten-Details**

### **ModernWizard.tsx** (Hauptkomponente)
```typescript
// State Management
const [currentStep, setCurrentStep] = useState(1);
const [startAddress, setStartAddress] = useState("");
const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
const [results, setResults] = useState<Result[]>([]);

// Event Handlers
const handleNext = () => setCurrentStep(currentStep + 1);
const handleBack = () => setCurrentStep(currentStep - 1);
const handleAddressSelect = (address: string, coordinates: [number, number]) => { ... };
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

### **Index-File** (`steps/index.ts`)
```typescript
export { Step1Address } from './Step1Address';
export { Step2Selection } from './Step2Selection';
export { Step3Results } from './Step3Results';
```

### **Verwendung**
```typescript
import { Step1Address, Step2Selection, Step3Results } from "./steps";
```

## 🎨 **Design-Konsistenz**

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
1. Neue Step-Komponente erstellen
2. Interface definieren
3. In `index.ts` exportieren
4. In `ModernWizard.tsx` integrieren

### **Step-Reihenfolge ändern**
```typescript
const steps: WizardStep[] = [
  { id: 1, title: "Neuer Step", ... },
  { id: 2, title: "Startadresse", ... },
  // ...
];
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
// Step1Address.test.tsx
describe('Step1Address', () => {
  it('should call onAddressSelect when address is selected', () => {
    // Test implementation
  });
});
```

### **Integration Tests**
```typescript
// ModernWizard.test.tsx
describe('ModernWizard', () => {
  it('should navigate through all steps', () => {
    // Test workflow
  });
});
```

## 📊 **Performance Optimierungen**

### **Lazy Loading**
```typescript
const Step3Results = lazy(() => import('./steps/Step3Results'));
```

### **Memoization**
```typescript
const MemoizedStep = memo(StepComponent);
```

### **Code Splitting**
```typescript
// Automatisch durch Vite
```

---

**Die modulare Struktur macht den Wizard wartbar, erweiterbar und testbar!** 🎉 
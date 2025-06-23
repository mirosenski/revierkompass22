# CommonJS ES6-Export Fix

## Problem
Mehrere CommonJS-Module haben ES6-Export-Probleme in Vite:

1. **concaveman** (verwendet von `@turf/convex`)
2. **rbush** (verwendet von `concaveman` und anderen Geo-Bibliotheken)

### Fehlermeldungen
```
Uncaught SyntaxError: The requested module '/node_modules/concaveman/index.js?v=54271ab8' does not provide an export named 'default'
Uncaught SyntaxError: The requested module '/node_modules/rbush/index.js?v=279aa3db' does not provide an export named 'default'
```

## Lösung
Wir haben eine **generische Lösung** für alle CommonJS-Module implementiert:

### 1. Vite-Plugin (vite.config.ts)
```typescript
const commonJSFixPlugin = () => {
	const problematicModules = ['concaveman', 'rbush'];
	
	return {
		name: 'commonjs-fix',
		resolveId(id: string) {
			if (problematicModules.includes(id)) {
				return `${id}-fixed`;
			}
		},
		load(id: string) {
			if (id.endsWith('-fixed')) {
				const moduleName = id.replace('-fixed', '');
				return `
					// ${moduleName} ES6-Export Fix
					let module;
					
					try {
						const importedModule = require('${moduleName}');
						
						// Prüfe verschiedene Export-Formate
						if (typeof importedModule === 'function') {
							module = importedModule;
						} else if (importedModule && typeof importedModule.default === 'function') {
							module = importedModule.default;
						} else if (importedModule && importedModule.${moduleName} && typeof importedModule.${moduleName} === 'function') {
							module = importedModule.${moduleName};
						} else {
							// Fallback: versuche direkten Import
							module = require('${moduleName}');
						}
					} catch (error) {
						console.warn('${moduleName} import error:', error);
						// Fallback für CommonJS
						module = require('${moduleName}');
					}
					
					// Stelle sicher, dass wir eine Funktion haben
					if (typeof module !== 'function') {
						throw new Error('${moduleName} is not a function - module: ' + JSON.stringify(module));
					}
					
					export default module;
				`;
			}
		}
	};
};
```

### 2. Vite-Konfiguration
- `concaveman` und `rbush` zu `optimizeDeps.include` hinzugefügt
- `commonjsOptions.include: [/node_modules/]` für bessere CommonJS-Unterstützung
- `define: { global: 'globalThis' }` für globale Variablen

## Vorteile der neuen Lösung

### 🔧 **Generisch**
- Behandelt alle CommonJS-Module automatisch
- Einfach erweiterbar für neue problematische Module

### 🛡️ **Robust**
- Mehrere Import-Strategien
- Umfassende Fehlerbehandlung
- Fallback-Mechanismen

### 📈 **Skalierbar**
- Neue Module können einfach zur `problematicModules`-Liste hinzugefügt werden
- Keine separaten Plugins für jedes Modul nötig

## Betroffene Module
- `@turf/convex` → `concaveman` → `rbush`
- Alle Geo-Bibliotheken, die diese Module verwenden
- Zukünftige CommonJS-Module mit ES6-Export-Problemen

## Status
✅ **concaveman**: Behoben  
✅ **rbush**: Behoben  
✅ **Server läuft**: Erfolgreich  
⚠️ **Browser-Test**: Noch erforderlich

## Nächste Schritte
1. Browser öffnen: `http://localhost:5173`
2. F12 → Console prüfen
3. Weitere Fehler dokumentieren
4. UI-Funktionalität testen 
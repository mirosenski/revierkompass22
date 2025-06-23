import type { Praesidium, Revier } from '../stores/wizard';

// Raw CSV data interface
interface RawPoliceData {
  sl_store: string;
  sl_address: string;
  sl_city: string;
  sl_zip: string;
  sl_latitude: string;
  sl_longitude: string;
  sl_tags: string;
  sl_phone: string;
  Polizeipräsidium: string;
}

// Process CSV data into typed structures
export function processPoliceData(csvData: RawPoliceData[]): { praesidien: Praesidium[], reviere: Revier[] } {
  const praesidienMap = new Map<string, Praesidium>();
  const reviere: Revier[] = [];

  // Filter out unwanted entries
  const filteredData = csvData.filter(item => {
    const isPolizeirevier = item.sl_tags === 'Polizeirevier';
    const isPolizeipraesidium = item.sl_tags === 'Polizeipräsidium';
    const isValidEntry = isPolizeirevier || isPolizeipraesidium;
    
    // Skip these types as per legacy analysis
    const shouldExclude = item.sl_store.includes('Polizeiposten') ||
                         item.sl_store.includes('Hochschule für Polizei') ||
                         item.sl_store.includes('Kriminalinspektionen') ||
                         item.sl_store.includes('Wasserschutzpolizei');
    
    return isValidEntry && !shouldExclude;
  });

  // Process each entry
  filteredData.forEach((item, index) => {
    const lat = parseFloat(item.sl_latitude);
    const lng = parseFloat(item.sl_longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      console.warn(`Invalid coordinates for ${item.sl_store}`);
      return;
    }

    const coordinates: [number, number] = [lng, lat]; // [longitude, latitude] for consistency with geojson
    const praesidiumName = item.Polizeipräsidium;
    
    // Ensure Praesidium exists
    if (!praesidienMap.has(praesidiumName)) {
      // Find a Präsidium entry with the same name to get its coordinates
      const praesidiumEntry = filteredData.find(p => 
        p.sl_tags === 'Polizeipräsidium' && p.Polizeipräsidium === praesidiumName
      );
      
      let praesidiumCoords: [number, number];
      if (praesidiumEntry) {
        const pLat = parseFloat(praesidiumEntry.sl_latitude);
        const pLng = parseFloat(praesidiumEntry.sl_longitude);
        praesidiumCoords = [pLng, pLat];
      } else {
        // Use first Revier coordinates as fallback
        praesidiumCoords = coordinates;
      }

      praesidienMap.set(praesidiumName, {
        id: `praesidium-${praesidiumName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: praesidiumName,
        coordinates: praesidiumCoords,
        childReviere: []
      });
    }

    // Create Revier if it's a police station
    if (item.sl_tags === 'Polizeirevier') {
      const revier: Revier = {
        id: `revier-${index}`,
        name: item.sl_store,
        praesidiumId: praesidienMap.get(praesidiumName)!.id,
        coordinates,
        contact: {
          address: `${item.sl_address}, ${item.sl_zip} ${item.sl_city}`,
          phone: item.sl_phone || undefined,
        }
      };

      reviere.push(revier);
      praesidienMap.get(praesidiumName)!.childReviere.push(revier.id);
    }
  });

  return {
    praesidien: Array.from(praesidienMap.values()),
    reviere
  };
}

// Raw CSV data from cleaned_police_data.csv
export const rawPoliceData: RawPoliceData[] = [
  // Will be populated from the CSV file
];

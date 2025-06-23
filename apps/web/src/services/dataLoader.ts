import { processPoliceData } from '../data/processPoliceData';
import type { Praesidium, Revier } from '../stores/wizard';

// Parse CSV data
function parseCSV(csvText: string) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
}

let cachedPraesidien: Praesidium[] | null = null;
let cachedReviere: Revier[] | null = null;

export async function loadPoliceData(): Promise<{ praesidien: Praesidium[], reviere: Revier[] }> {
  if (cachedPraesidien && cachedReviere) {
    return { praesidien: cachedPraesidien, reviere: cachedReviere };
  }

  try {
    const response = await fetch('/data/cleaned_police_data.csv');
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const rawData = parseCSV(csvText);
    
    const processed = processPoliceData(rawData);
    
    cachedPraesidien = processed.praesidien;
    cachedReviere = processed.reviere;
    
    console.log(`Loaded ${processed.praesidien.length} Präsidien and ${processed.reviere.length} Reviere`);
    
    return processed;
  } catch (error) {
    console.error('Failed to load police data:', error);
    
    // Fallback to mock data if CSV loading fails
    const { mockPraesidien, mockReviere } = await import('../data/mockData');
    return { praesidien: mockPraesidien, reviere: mockReviere };
  }
}

export async function getPraesidienBySearch(query: string): Promise<Praesidium[]> {
  const { praesidien } = await loadPoliceData();
  
  if (!query.trim()) {
    return praesidien;
  }
  
  const searchTerm = query.toLowerCase();
  return praesidien.filter(p => 
    p.name.toLowerCase().includes(searchTerm)
  );
}

export async function getReviereByPraesidium(praesidiumId: string): Promise<Revier[]> {
  const { reviere } = await loadPoliceData();
  
  return reviere.filter(r => r.praesidiumId === praesidiumId);
}

export async function getAllReviere(): Promise<Revier[]> {
  const { reviere } = await loadPoliceData();
  return reviere;
}

export async function getPraesidiumById(id: string): Promise<Praesidium | undefined> {
  const { praesidien } = await loadPoliceData();
  return praesidien.find(p => p.id === id);
}

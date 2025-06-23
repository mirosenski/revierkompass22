import type { Praesidium, Revier } from "../stores/wizard";

// Stadtteile und Straßennamen für realistische Daten
const stadtteile = [
	"Mitte",
	"Nord",
	"Süd",
	"Ost",
	"West",
	"Altstadt",
	"Neustadt",
	"Hafen",
	"Bahnhof",
	"Universität",
	"Gewerbegebiet",
	"Wohngebiet",
];

const strassenPrefixe = [
	"Haupt",
	"Bahnhof",
	"Kirch",
	"Schul",
	"Markt",
	"Berliner",
	"Münchner",
	"Hamburger",
	"Kölner",
	"Frankfurter",
	"Leipziger",
	"Dresdner",
];

const strassenSuffixe = ["straße", "weg", "allee", "platz", "gasse", "ring", "damm"];

// Generiere zufällige Koordinaten innerhalb Deutschlands
function generateCoordinates(): [number, number] {
	// Deutschland ungefähr: 47.3-55.0 N, 5.9-15.0 E
	const lat = 47.3 + Math.random() * (55.0 - 47.3);
	const lon = 5.9 + Math.random() * (15.0 - 5.9);
	return [lon, lat];
}

// Generiere Telefonnummer
function generatePhone(): string {
	const vorwahl = ["030", "040", "089", "0221", "069", "0341", "0351"][
		Math.floor(Math.random() * 7)
	];
	const nummer = Math.floor(Math.random() * 9000000) + 1000000;
	return `${vorwahl} ${nummer}`;
}

// Generiere E-Mail
function generateEmail(name: string): string {
	const domain = ["polizei.de", "polizei.nrw.de", "polizei.bayern.de"][
		Math.floor(Math.random() * 3)
	];
	const cleanName = name
		.toLowerCase()
		.replace(/[äöü]/g, (char) => ({ ä: "ae", ö: "oe", ü: "ue" })[char] || char)
		.replace(/\s+/g, ".")
		.replace(/[^a-z0-9.-]/g, "");

	return `${cleanName}@${domain}`;
}

// Generiere Adresse
function generateAddress(stadtname: string): string {
	const prefix = strassenPrefixe[Math.floor(Math.random() * strassenPrefixe.length)];
	const suffix = strassenSuffixe[Math.floor(Math.random() * strassenSuffixe.length)];
	const hausnummer = Math.floor(Math.random() * 200) + 1;
	const plz = Math.floor(Math.random() * 90000) + 10000;

	return `${prefix}${suffix} ${hausnummer}, ${plz} ${stadtname}`;
}

// Generiere Präsidien
export function generatePraesidien(count: number): Praesidium[] {
	const praesidien: Praesidium[] = [];
	const städte = [
		"Berlin",
		"Hamburg",
		"München",
		"Köln",
		"Frankfurt",
		"Stuttgart",
		"Düsseldorf",
		"Dortmund",
		"Essen",
		"Leipzig",
		"Bremen",
		"Dresden",
		"Hannover",
		"Nürnberg",
		"Duisburg",
		"Bochum",
		"Wuppertal",
		"Bielefeld",
	];

	for (let i = 0; i < count && i < städte.length; i++) {
		const stadt = städte[i];
		const id = `pp-${stadt.toLowerCase()}`;

		// Generiere 5-20 Reviere pro Präsidium
		const reviereCount = Math.floor(Math.random() * 16) + 5;
		const childReviere = [];

		for (let j = 0; j < reviereCount; j++) {
			childReviere.push(`${id}-revier-${j + 1}`);
		}

		praesidien.push({
			id,
			name: `Polizeipräsidium ${stadt}`,
			coordinates: generateCoordinates(),
			childReviere,
		});
	}

	return praesidien;
}

// Generiere Reviere für ein Präsidium
export function generateReviere(praesidium: Praesidium): Revier[] {
	const reviere: Revier[] = [];
	const stadtname = praesidium.name.replace("Polizeipräsidium ", "");

	praesidium.childReviere.forEach((revierId, index) => {
		const stadtteil = stadtteile[index % stadtteile.length];
		const revierNummer = index + 1;

		reviere.push({
			id: revierId,
			name: `Polizeirevier ${revierNummer} - ${stadtname} ${stadtteil}`,
			praesidiumId: praesidium.id,
			coordinates: generateCoordinates(),
			geometry: {
				type: "Polygon",
				coordinates: [[]], // Würde mit echten GeoJSON-Daten gefüllt
			},
			contact: {
				address: generateAddress(stadtname),
				phone: generatePhone(),
				email: generateEmail(`revier${revierNummer}.${stadtname}`),
			},
		});
	});

	return reviere;
}

// Generiere kompletten Datensatz
export function generateMockData(praesidienCount: number = 20) {
	const praesidien = generatePraesidien(praesidienCount);
	const alleReviere: Revier[] = [];

	praesidien.forEach((praesidium) => {
		const reviere = generateReviere(praesidium);
		alleReviere.push(...reviere);
	});

	return {
		praesidien,
		reviere: alleReviere,
		stats: {
			totalPraesidien: praesidien.length,
			totalReviere: alleReviere.length,
			avgRevierePerPraesidium: Math.round(alleReviere.length / praesidien.length),
		},
	};
}

// Cache für Performance
let cachedData: ReturnType<typeof generateMockData> | null = null;

export function getLargeMockDataset() {
	if (!cachedData) {
		cachedData = generateMockData(20);
	}
	return cachedData;
}

// Helper für Tests
export function searchPraesidien(query: string, praesidien: Praesidium[]): Praesidium[] {
	const searchTerm = query.toLowerCase();
	return praesidien.filter((p) => p.name.toLowerCase().includes(searchTerm));
}

export function getReviereByPraesidiumIdLarge(praesidiumId: string, reviere: Revier[]): Revier[] {
	return reviere.filter((r) => r.praesidiumId === praesidiumId);
}

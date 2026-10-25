// Product data for the fictional ORIEL Calibre O-1. Prices are invented for the concept.

export const FINISHES = [
  { id: 'steel', name: 'Steel', material: '904L stainless steel', price: 8400, swatch: '#b9bcc0' },
  { id: 'rosegold', name: 'Rose gold', material: '18k rose gold', price: 24800, swatch: '#d6a58c' },
  { id: 'ceramic', name: 'Black ceramic', material: 'Zirconium-oxide ceramic', price: 12600, swatch: '#232325' },
];

export const DIALS = [
  { id: 'midnight', name: 'Midnight', description: 'Sunburst blue lacquer', swatch: '#1a2a4a', strap: 'Navy calfskin' },
  { id: 'ivory', name: 'Ivory', description: 'Cream lacquer, grained', swatch: '#ece2cc', strap: 'Cognac calfskin' },
  { id: 'malachite', name: 'Malachite', description: 'Deep green sunburst', swatch: '#1f4d3a', strap: 'Forest calfskin' },
];

export const EDITIONS = [
  {
    id: 'minuit',
    name: 'Édition Minuit',
    finish: 'steel',
    dial: 'midnight',
    tagline: 'Steel, after dark.',
    description: 'Satin steel and a blue sunburst dial that turns almost black away from the light.',
  },
  {
    id: 'aube',
    name: 'Édition Aube',
    finish: 'rosegold',
    dial: 'ivory',
    tagline: 'Gold at first light.',
    description: 'Warm 18k rose gold around a grained ivory dial, the softest of the three.',
  },
  {
    id: 'foret',
    name: 'Édition Forêt',
    finish: 'ceramic',
    dial: 'malachite',
    tagline: 'Black ceramic, green shade.',
    description: 'A scratch-proof ceramic case that never warms, framing a deep green sunburst.',
  },
];

export const DEFAULT_CONFIG = Object.freeze({ finish: 'steel', dial: 'midnight' });

/** The seven layers of the exploded view, top (crystal) to bottom (caseback). */
export const LAYERS = [
  { id: 'crystal', index: '01', name: 'Sapphire crystal', note: 'Domed and anti-reflective on both sides. Nine on the Mohs scale.' },
  { id: 'bezel', index: '02', name: 'Bezel', note: 'Polished, with a 0.3 mm step that catches a single line of light.' },
  { id: 'hands', index: '03', name: 'Hands', note: 'Dauphine, faceted by hand, filled with luminescent paint.' },
  { id: 'dial', index: '04', name: 'Dial', note: 'Brass, fourteen coats of lacquer, twelve applied indices.' },
  { id: 'movement', index: '05', name: 'Movement', note: 'Calibre O-1. 212 components, 31 jewels, regulated in five positions.' },
  { id: 'case', index: '06', name: 'Case', note: '40 mm across, 11.2 mm thick. Satin flanks, polished bevels.' },
  { id: 'caseback', index: '07', name: 'Caseback', note: 'Screwed down around a sapphire window. Water resistant to 100 m.' },
];

export const MOVEMENT_CHAPTERS = [
  {
    id: 'escapement',
    index: 'i',
    title: 'The escapement',
    body: 'Twenty-eight thousand eight hundred times an hour, the pallet fork lets one tooth of the escape wheel go. You hear it as a tick. We hear a heartbeat.',
    stat: '28,800',
    unit: 'beats per hour',
  },
  {
    id: 'barrel',
    index: 'ii',
    title: 'The mainspring',
    body: 'A coiled blade inside the barrel stores the energy of your wrist. Fully wound, it runs for three days, long enough to leave on the nightstand for a weekend.',
    stat: '72',
    unit: 'hours of reserve',
  },
  {
    id: 'rotor',
    index: 'iii',
    title: 'The rotor',
    body: 'A half-moon of solid gold swings with every gesture and winds the spring in both directions. Movement, turned into time.',
    stat: '360°',
    unit: 'bidirectional winding',
  },
];

export const NUMBERS = [
  { value: 212, label: 'Components', caption: 'Every one finished before it is fitted.' },
  { value: 31, label: 'Jewels', caption: 'Synthetic rubies where metal meets metal.' },
  { value: 72, label: 'Hours', caption: 'Of power reserve, fully wound.' },
  { value: 100, label: 'Metres', caption: 'Of water resistance, tested on every piece.' },
  { value: 11, label: 'Months', caption: 'From first part to finished watch.' },
  { value: 300, label: 'Pieces', caption: 'Made each year, each one numbered.' },
];

export const SPECS = [
  { group: 'Case', items: [['Diameter', '40 mm'], ['Thickness', '11.2 mm'], ['Lug to lug', '47 mm'], ['Crystal', 'Domed sapphire, AR both sides'], ['Caseback', 'Screwed, sapphire window'], ['Water resistance', '100 m / 10 bar']] },
  { group: 'Movement', items: [['Calibre', 'O-1, automatic'], ['Frequency', '28,800 vph (4 Hz)'], ['Power reserve', '72 hours'], ['Jewels', '31'], ['Components', '212'], ['Finishing', 'Côtes de Genève, perlage, blued screws']] },
  { group: 'Dial & strap', items: [['Dial', 'Lacquered brass, applied indices'], ['Hands', 'Dauphine, luminescent'], ['Strap', 'Calfskin, 20 mm, pin buckle'], ['In the box', 'Second strap, walnut case']] },
];

export const findFinish = (id) => FINISHES.find((f) => f.id === id) ?? FINISHES[0];
export const findDial = (id) => DIALS.find((d) => d.id === id) ?? DIALS[0];
export const findEdition = (id) => EDITIONS.find((e) => e.id === id) ?? null;
export const editionFor = (finish, dial) => EDITIONS.find((e) => e.finish === finish && e.dial === dial) ?? null;

export const priceOf = (finish) => findFinish(finish).price;

const currency = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
export const formatPrice = (n) => currency.format(n);

const base = import.meta.env.BASE_URL;
export const posterFor = (finish, dial) => `${base}media/config-${finish}-${dial}.webp`;

export function productHref({ finish, dial }) {
  const edition = editionFor(finish, dial);
  return edition ? `${base}product.html?edition=${edition.id}` : `${base}product.html?finish=${finish}&dial=${dial}`;
}

/** Display name for any configuration: the edition name, or "Calibre O-1" for made-to-order combinations. */
export function nameFor({ finish, dial }) {
  return editionFor(finish, dial)?.name ?? 'Calibre O-1';
}

export function describe({ finish, dial }) {
  return `${findFinish(finish).name} · ${findDial(dial).name} dial`;
}

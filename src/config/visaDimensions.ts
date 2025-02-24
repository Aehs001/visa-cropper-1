
interface VisaDimensions {
  country: string;
  width: number;  // in pixels
  height: number; // in pixels
  description: string;
}

export const visaDimensions: VisaDimensions[] = [
  {
    country: "United States",
    width: 600,
    height: 600,
    description: "2x2 inches (51x51 mm)",
  },
  {
    country: "Schengen",
    width: 413,
    height: 531,
    description: "35x45 mm",
  },
  {
    country: "United Kingdom",
    width: 450,
    height: 550,
    description: "35x45 mm",
  },
  {
    country: "Canada",
    width: 413,
    height: 531,
    description: "35x45 mm",
  },
  {
    country: "India",
    width: 413,
    height: 531,
    description: "2x2 inches (51x51 mm)",
  },
];


interface VisaDimensions {
  country: string;
  width: number;  // in pixels
  height: number; // in pixels
  description: string;
  region: string;
}

export const visaDimensions: VisaDimensions[] = [
  // Americas
  {
    country: "United States",
    width: 600,
    height: 600,
    description: "2x2 inches (51x51 mm)",
    region: "Americas"
  },
  {
    country: "Canada",
    width: 590,
    height: 826,
    description: "50x70 mm",
    region: "Americas"
  },
  {
    country: "Mexico",
    width: 366,
    height: 460,
    description: "31x39 mm",
    region: "Americas"
  },
  {
    country: "Brazil",
    width: 590,
    height: 826,
    description: "50x70 mm",
    region: "Americas"
  },
  {
    country: "Argentina",
    width: 472,
    height: 472,
    description: "40x40 mm",
    region: "Americas"
  },
  // Europe
  {
    country: "United Kingdom",
    width: 413,
    height: 531,
    description: "35x45 mm",
    region: "Europe"
  },
  {
    country: "Schengen",
    width: 413,
    height: 531,
    description: "35x45 mm (EU countries)",
    region: "Europe"
  },
  {
    country: "Russia",
    width: 413,
    height: 531,
    description: "35x45 mm",
    region: "Europe"
  },
  {
    country: "Turkey",
    width: 590,
    height: 708,
    description: "50x60 mm",
    region: "Europe"
  },
  {
    country: "Switzerland",
    width: 413,
    height: 531,
    description: "35x45 mm",
    region: "Europe"
  },
  // Asia
  {
    country: "India",
    width: 600,
    height: 600,
    description: "2x2 inches (51x51 mm)",
    region: "Asia"
  },
  {
    country: "China",
    width: 390,
    height: 567,
    description: "33x48 mm",
    region: "Asia"
  },
  {
    country: "Japan",
    width: 413,
    height: 531,
    description: "35x45 mm",
    region: "Asia"
  },
  {
    country: "South Korea",
    width: 413,
    height: 531,
    description: "35x45 mm",
    region: "Asia"
  },
  {
    country: "Thailand",
    width: 472,
    height: 708,
    description: "40x60 mm",
    region: "Asia"
  },
  {
    country: "Vietnam",
    width: 472,
    height: 708,
    description: "40x60 mm",
    region: "Asia"
  },
  {
    country: "Indonesia",
    width: 413,
    height: 531,
    description: "35x45 mm",
    region: "Asia"
  },
  {
    country: "Philippines",
    width: 413,
    height: 531,
    description: "35x45 mm",
    region: "Asia"
  },
  // Africa
  {
    country: "South Africa",
    width: 413,
    height: 531,
    description: "35x45 mm",
    region: "Africa"
  },
  {
    country: "Nigeria",
    width: 413,
    height: 531,
    description: "35x45 mm",
    region: "Africa"
  },
  {
    country: "Kenya",
    width: 413,
    height: 531,
    description: "35x45 mm",
    region: "Africa"
  },
  {
    country: "Egypt",
    width: 472,
    height: 708,
    description: "40x60 mm",
    region: "Africa"
  },
  // Middle East
  {
    country: "United Arab Emirates",
    width: 472,
    height: 708,
    description: "40x60 mm",
    region: "Middle East"
  },
  {
    country: "Saudi Arabia",
    width: 472,
    height: 708,
    description: "40x60 mm",
    region: "Middle East"
  },
  {
    country: "Israel",
    width: 413,
    height: 531,
    description: "35x45 mm",
    region: "Middle East"
  },
  {
    country: "Qatar",
    width: 413,
    height: 531,
    description: "35x45 mm",
    region: "Middle East"
  }
];


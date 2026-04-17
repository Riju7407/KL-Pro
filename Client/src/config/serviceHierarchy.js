export const SERVICE_HIERARCHY = {
  HelpingHand: {
    "Twenty Minutes": ["Laundry Ironing", "Packing & UnPacking", "Mopping & Dusting Wiping", "Meal preparing and serving", "Kitchen & Utensil Cleaning"],
    Schedule: ["Bathroom Cleaning", "Laundry Ironing", "Packing & UnPacking", "Mopping & Dusting Wiping", "Meal preparing and serving", "Kitchen & Utensil Cleaning"],
  },
  "Women's Salon & Spa": {
    "Salon for Women": ["Luxe", "Prime"],
    "Spa for Women": ["Ayurveda", "Prime", "Luxe"],
    "Hair Studio for Women": ["Blow-dry & style", "Cut & trim", "Hair care", "Keratin & botox", "Hair colour", "Hair extensions", "Fashion color"],
    "Makeup & Saree & Styling": ["Saree draping", "Wedding combos", "Party makeup", "Hair styling", "Add-ons"],
  },
  "Men's Salon & Massage": {
    "Salon for men": ["Royale", "Prime"],
    "Massage for Men": ["Prime", "Ayurveda", "Royale"],
  },
  "Cleaning & Pest Control": {
    Cleaning: ["Bathroom Cleaning", "Kitchen Cleaning", "Living & Bedroom Cleaning", "Full Home/Book by Room Cleaning"],
    "Pest Control": ["Cockroach Control", "Termite Control", "Bed Bugs Control", "Ant Control"],
  },
  "AC & Appliance Repair": {
    "Large appliances": ["AC Service & Repair", "Washing Machine", "Refrigerator", "Telivision"],
    "Other appliances": ["Chimney", "Microwave", "Stove", "Laptop", "Water Purifier Repair", "Geyser", "Air Cooler"],
  },
  "Electrician, Plumber, Carpenter & Mason": {
    Repairs: ["Electrician", "Plumber", "Carpenter"],
    "Installations & other services": ["Fan Installation", "Furniture Assembly", "Geyser", "IKEA Furniture Assembly", "Tile Grouting"],
    "Mason Services": ["Mistry & Labour"],
  },
  "Home Decoration": {
    Electrician: ["Festival Lights Installation"],
    Decorator: ["Home Decoration"],
  },
};

const buildServiceTypeKey = (category, subCategory, subSubCategory) =>
  `${category}|||${subCategory}|||${subSubCategory}`;

export const SERVICE_TYPE_HIERARCHY = {
  [buildServiceTypeKey("Women's Salon & Spa", "Salon for Women", "Luxe")]: [
    "Waxing",
    "Bridal Facial",
    "Korean Facial",
    "Signature Facial",
    "Cleanup",
    "Pedicure & manicure",
    "Threading & face wax",
    "Bleach & detan & massage",
  ],
  [buildServiceTypeKey("Women's Salon & Spa", "Salon for Women", "Prime")]: [
    "Waxing & threading",
    "Korean Facial",
    "Signature Facial",
    "Cleanup",
    "Pedicure & manicure",
    "Hair& bleach & detan",
  ],
  [buildServiceTypeKey("Women's Salon & Spa", "Spa for Women", "Ayurveda")]: [
    "Stress relief",
    "Pain relief",
    "Ayurvedic skin care",
    "Add-ons",
  ],
  [buildServiceTypeKey("Women's Salon & Spa", "Spa for Women", "Prime")]: [
    "Stress relief",
    "Pain relief",
    "Skin care scrubs",
    "Post Natal",
    "Add-ons",
  ],
  [buildServiceTypeKey("Women's Salon & Spa", "Spa for Women", "Luxe")]: [
    "Pain relief",
    "Signature therapy",
    "Natural skincare",
    "Add-ons",
  ],
  [buildServiceTypeKey("Men's Salon & Massage", "Salon for men", "Royale")]: [
    "Pedicure",
    "Hair care",
    "Face care",
    "Shave/beard grooming",
    "Hair color",
    "Massage",
  ],
  [buildServiceTypeKey("Men's Salon & Massage", "Massage for Men", "Prime")]: [
    "Pain relief",
    "Stress relief",
    "Post workout",
    "Add-ons",
  ],
  [buildServiceTypeKey("Men's Salon & Massage", "Massage for Men", "Ayurveda")]: [
    "Stress relief",
    "Pain relief",
    "Add-ons",
  ],
  [buildServiceTypeKey("Men's Salon & Massage", "Massage for Men", "Royale")]: [
    "Pain relief",
    "Stress relief",
    "Sports therapy",
    "Signature therapy",
    "Add-ons",
  ],
  [buildServiceTypeKey("Cleaning & Pest Control", "Cleaning", "Bathroom Cleaning")]: [
    "One time deep clean",
    "Balcony cleaning",
    "Mini services",
  ],
  [buildServiceTypeKey("Cleaning & Pest Control", "Cleaning", "Kitchen Cleaning")]: [
    "Chimney cleaning",
    "Complete kitchen cleaning",
    "Appliance cleaning",
    "Cabinets & tiles",
    "Mini services",
  ],
  [buildServiceTypeKey("Cleaning & Pest Control", "Cleaning", "Living & Bedroom Cleaning")]: [
    "Sofa & carpet",
    "Living room care",
    "Bedroom care",
    "Mattress & bed",
    "Dining table & chairs",
    "Other furniture",
    "Windows & fan",
  ],
  [buildServiceTypeKey("Cleaning & Pest Control", "Cleaning", "Full Home/Book by Room Cleaning")]: [
    "Apartment",
    "Bungalow/duplex",
    "Book by room",
    "Mini services",
  ],
  [buildServiceTypeKey("Cleaning & Pest Control", "Pest Control", "Cockroach Control")]: [
    "Kitchen/Bathroom",
    "Apartment/Bunglow",
  ],
  [buildServiceTypeKey("Cleaning & Pest Control", "Pest Control", "Termite Control")]: [
    "Apartment termite control",
    "Bungalow termite control",
  ],
  [buildServiceTypeKey("Cleaning & Pest Control", "Pest Control", "Bed Bugs Control")]: ["Bed Bugs Control"],
  [buildServiceTypeKey("Cleaning & Pest Control", "Pest Control", "Ant Control")]: [
    "Apartment/Bunglow",
    "Kitchen/Bathroom",
  ],
  [buildServiceTypeKey("AC & Appliance Repair", "Large appliances", "AC Service & Repair")]: [
    "Service",
    "Repair & gas refill",
    "Installation/uninstallation",
  ],
  [buildServiceTypeKey("AC & Appliance Repair", "Large appliances", "Washing Machine")]: [
    "Servicing",
    "Repair",
    "Installation & uninstallation",
  ],
  [buildServiceTypeKey("AC & Appliance Repair", "Large appliances", "Refrigerator")]: ["Refrigerator check-up"],
  [buildServiceTypeKey("AC & Appliance Repair", "Large appliances", "Telivision")]: [
    "TV check-up",
    "TV Installation",
    "TV Uninstallation",
  ],
  [buildServiceTypeKey("AC & Appliance Repair", "Other appliances", "Chimney")]: [
    "Repair",
    "Service",
    "Installation/uninstallation",
  ],
  [buildServiceTypeKey("AC & Appliance Repair", "Other appliances", "Microwave")]: ["Microwave check-up"],
  [buildServiceTypeKey("AC & Appliance Repair", "Other appliances", "Stove")]: ["Service", "Repair"],
  [buildServiceTypeKey("AC & Appliance Repair", "Other appliances", "Laptop")]: [
    "Laptop/Desktop service",
    "System upgrade consultation",
    "Component Installation",
    "Laptop check-up",
  ],
  [buildServiceTypeKey("AC & Appliance Repair", "Other appliances", "Water Purifier Repair")]: ["Water Purifier Repair"],
  [buildServiceTypeKey("AC & Appliance Repair", "Other appliances", "Geyser")]: [
    "Repair & service",
    "Installation & uninstallation",
  ],
  [buildServiceTypeKey("AC & Appliance Repair", "Other appliances", "Air Cooler")]: ["Repair & service"],
  [buildServiceTypeKey("Electrician, Plumber, Carpenter & Mason", "Repairs", "Electrician")]: [
    "Switch & socket",
    "Fan",
    "Light",
    "Wiring",
    "Doorbell & security",
    "MCB/fuse",
    "Appliances",
    "Book a consultation",
  ],
  [buildServiceTypeKey("Electrician, Plumber, Carpenter & Mason", "Repairs", "Plumber")]: [
    "Tap & mixe,r",
    "Toilet",
    "Bath & shower",
    "Bath accessories",
    "Basin & sink",
    "Drainage & blockage",
    "Leakage & connections",
    "Water tank & motor",
    "Book a consultation",
  ],
  [buildServiceTypeKey("Electrician, Plumber, Carpenter & Mason", "Repairs", "Carpenter")]: [
    "Wooden door",
    "Cupboard & drawer",
    "Decor & mirror",
    "Shelf & cabinet",
    "Lock & Hinge",
    "Curtain & window",
    "Funiture repair",
    "Funiture assembly",
    "Kitchen fittings",
    "Bath fittings & mirrors",
    "Balcony fittings",
    "At home consultation",
  ],
  [buildServiceTypeKey("Electrician, Plumber, Carpenter & Mason", "Installations & other services", "Fan Installation")]: [
    "Installation/replacement",
    "Uninstallation",
  ],
  [buildServiceTypeKey("Electrician, Plumber, Carpenter & Mason", "Installations & other services", "Furniture Assembly")]: [
    "Wooden bed",
    "Wardrobe",
    "Dining & kitchen",
    "Tables & chairs",
    "Children",
    "Living & TV",
    "Outdoor",
    "Religious",
    "Cabinet/shelving unit",
  ],
  [buildServiceTypeKey("Electrician, Plumber, Carpenter & Mason", "Installations & other services", "Geyser")]: [
    "Repair & service",
    "Installation & uninstallation",
  ],
  [buildServiceTypeKey("Electrician, Plumber, Carpenter & Mason", "Installations & other services", "IKEA Furniture Assembly")]: [
    "Wardrobes",
    "Tables & drawers",
    "Children Beds & dining",
    "Seating",
    "Outdoor",
    "Storage",
    "Furnishing",
    "Bathroom",
    "Washbasin cabinets",
    "TV furniture",
    "Kitchen",
  ],
  [buildServiceTypeKey("Electrician, Plumber, Carpenter & Mason", "Installations & other services", "Tile Grouting")]: [
    "Waterproofing",
    "Indoor grouting",
    "Outdoor grouting",
  ],
  [buildServiceTypeKey("Electrician, Plumber, Carpenter & Mason", "Mason Services", "Mistry & Labour")]: [
    "Wall repair",
    "Malba Cleaning Support",
    "Support in Building Construction",
    "Bricks Loading & Unloading",
  ],
  [buildServiceTypeKey("Home Decoration", "Electrician", "Festival Lights Installation")]: [
    "Light unistallations",
    "Balcony lights",
    "Railing lights",
    "Room lights",
    "Mandir lights",
    "Outdoor lights",
    "Garden lights",
    "Xmas light decor",
    "Custom services",
  ],
  [buildServiceTypeKey("Home Decoration", "Decorator", "Home Decoration")]: [
    "Birthday Decoration",
    "Welcome Baby Decoration",
    "Welcome Bride Decoration",
    "Anniversary Decoration",
    "Retirement Decoration",
  ],
};

export function getServiceTypeOptions(category, subCategory, subSubCategory) {
  if (!category || !subCategory || !subSubCategory || subCategory === 'all' || subSubCategory === 'all') {
    return [];
  }

  return SERVICE_TYPE_HIERARCHY[buildServiceTypeKey(category, subCategory, subSubCategory)] || [];
}

export function getHierarchyOptions(category, subCategory, subSubCategory) {
  const categoryTree = SERVICE_HIERARCHY[category] || {};
  const subCategories = Object.keys(categoryTree);

  if (!subCategory || subCategory === "all") {
    return {
      subCategories,
      subSubCategories: [],
      serviceTypes: [],
    };
  }

  return {
    subCategories,
    subSubCategories: categoryTree[subCategory] || [],
    serviceTypes: getServiceTypeOptions(category, subCategory, subSubCategory),
  };
}

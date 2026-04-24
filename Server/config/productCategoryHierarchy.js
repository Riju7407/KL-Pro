// Product Category Hierarchy Configuration
export const PRODUCT_CATEGORY_HIERARCHY = {
  "Branded Uniform For KLPro Professional": {
    Men: {
      "Jacket": ["S", "M", "L", "XL", "XXL", "XXXL"],
      "Pyajama": ["S", "M", "L", "XL", "XXL", "XXXL"],
      "T-Shirt": ["S", "M", "L", "XL", "XXL", "XXXL"],
      "Badge": ["S", "M", "L", "XL", "XXL", "XXXL"],
      "Cap": ["S", "M", "L", "XL", "XXL", "XXXL"],
      "Toolkit Bag": ["S", "M", "L", "XL", "XXL", "XXXL"],
    },
    Women: {
      "Jacket": ["S", "M", "L", "XL", "XXL", "XXXL"],
      "Pyajama": ["S", "M", "L", "XL", "XXL", "XXXL"],
      "T-Shirt": ["S", "M", "L", "XL", "XXL", "XXXL"],
      "Badge": ["S", "M", "L", "XL", "XXL", "XXXL"],
      "Cap": ["S", "M", "L", "XL", "XXL", "XXXL"],
      "Toolkit Bag": ["S", "M", "L", "XL", "XXL", "XXXL"],
    },
  },
  "Beauty & Salon Products": {
    "Beauticians, Hairstylists & Spa Professionals": {
      "Makeup kits": [],
      "Facial kits": [
        "Oily Face",
        "Dry Face",
        "Sensitive Face",
        "Acne Face",
        "Normal Face",
      ],
      "Skincare Products": [],
      "Waxing products (roll-ons, strips, wax)": [],
      "Hair styling tools (straighteners, curlers, dryers)": [],
      "Massage oils & spa essentials": [],
      "Disposable hygiene kits (gloves, sheets, towels)": [],
    },
  },
  "Cleaning Supplies & Equipment": {
    "Home Cleaning Professional (Bathroom, Kitchen, Living Room, Office Etc.)": {
      "Floor cleaners, chemicals, disinfectants": [],
      "Bathroom & kitchen cleaning solutions": [],
      "Microfiber cloths & mops & brushes": [],
      "Vacuum cleaners / steam machines": [],
      "Deep cleaning kits": [],
    },
  },
  "Repair & Maintenance Tools": {
    "Repairing and Maintenance Professional (Electricians, plumbers, AC technicians, carpenters Etc.)": {
      "Toolkits (spanners, drills, testers, etc.)": [],
      "Electrical repair tools": [],
      "Plumbing tools & fittings": [],
      "AC servicing tools (pressure pump, gas refill kits)": [],
      "Carpentry tools": [],
    },
  },
  "Grooming Equipment": {
    "Grooming Professionals (Men's Salon & Grooming Professionals)": {
      "Trimmers & clippers": [],
      "Shaving kits": [],
      "Grooming accessories": [],
      "Sterilization equipment": [],
    },
  },
  "Personal Protective Equipment": {
    "Hygiene & Safety Kits (All Service Categories)": {
      "Disposable gloves & masks": [],
      "Aprons & uniforms": [],
      "Sanitizers": [],
      "Single-use service kits (for salons/spa)": [],
    },
  },
  "Specialized Machines & Equipment": {
    Premium: {
      "Painting tools & machines": [],
      "Wall panel installation kits": [],
      "Pest control equipment": [],
      "Advanced cleaning machines": [],
    },
  },
};

// Helper function to get main categories
export const getMainCategories = () => {
  return Object.keys(PRODUCT_CATEGORY_HIERARCHY);
};

// Helper function to get subcategories for a main category
export const getSubcategories = (mainCategory) => {
  if (PRODUCT_CATEGORY_HIERARCHY[mainCategory]) {
    return Object.keys(PRODUCT_CATEGORY_HIERARCHY[mainCategory]);
  }
  return [];
};

// Helper function to get sub-subcategories for a subcategory
export const getSubSubcategories = (mainCategory, subcategory) => {
  if (
    PRODUCT_CATEGORY_HIERARCHY[mainCategory] &&
    PRODUCT_CATEGORY_HIERARCHY[mainCategory][subcategory]
  ) {
    return Object.keys(PRODUCT_CATEGORY_HIERARCHY[mainCategory][subcategory]);
  }
  return [];
};

// Helper function to get sizes for a sub-subcategory
export const getSizes = (mainCategory, subcategory, subSubcategory) => {
  if (
    PRODUCT_CATEGORY_HIERARCHY[mainCategory] &&
    PRODUCT_CATEGORY_HIERARCHY[mainCategory][subcategory] &&
    PRODUCT_CATEGORY_HIERARCHY[mainCategory][subcategory][subSubcategory]
  ) {
    return PRODUCT_CATEGORY_HIERARCHY[mainCategory][subcategory][
      subSubcategory
    ];
  }
  return [];
};

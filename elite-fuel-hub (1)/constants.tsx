
import React from 'react';
import { TrainingProgram, GroceryItem, BudgetTier, Goal } from './types';

export const GROCERY_DATA: Record<BudgetTier, Record<string, GroceryItem>> = {
  survival: {
    walmart: {
      title: "Walmart (Volume Haul)",
      cost: "~$55.00",
      protein: ["Great Value Frozen Chicken Thighs (3lb)", "3 dozen Large Eggs", "4 cans Tuna"],
      carbs: ["5lb White Rice", "Old Fashioned Oats", "5lb Russet Potatoes", "Bananas"],
      other: ["Peanut Butter", "2 bags Frozen Broccoli"]
    },
    aldi: {
      title: "Aldi (Efficiency Haul)",
      cost: "~$52.00",
      protein: ["Family Pack Chicken Thighs (~5lb)", "2 dozen Eggs", "2lb Ground Beef (80/20)"],
      carbs: ["5lb Jasmine Rice", "Sweet Potatoes", "Box of Oats", "Bananas"],
      other: ["Bag of Spinach", "Frozen Mixed Veggies", "Peanut Butter"]
    }
  },
  performance: {
    walmart: {
      title: "Walmart (Optimized Haul)",
      cost: "~$118.00",
      protein: ["6lb Frozen Chicken Thighs", "5 dozen Eggs", "2lb Lean Ground Beef", "1 Whole Chicken"],
      carbs: ["10lb Rice", "Oats", "Potatoes", "Pasta", "Tortillas"],
      other: ["Whey Protein Powder", "Creatine Monohydrate", "Olive Oil", "Fresh Spinach"]
    },
    aldi: {
      title: "Aldi (Quality Haul)",
      cost: "~$112.00",
      protein: ["3 Family Packs Chicken Thighs", "3 dozen Eggs", "2lb Lean Ground Beef", "Whole Chicken"],
      carbs: ["Jasmine Rice", "Sweet Potatoes", "Pasta", "Oats", "Berries"],
      other: ["Whey Protein Powder", "Avocados", "Spinach", "Mixed Nuts"]
    }
  }
};

export const TRAINING_PROGRAMS: Record<string, TrainingProgram> = {
  offseason: {
    title: "Off-Season Strength & Power",
    desc: "High Intensity, Lower Frequency.",
    days: [
      { day: "Mon", focus: "Upper Strength", details: "Bench, Rows, OHP" },
      { day: "Tue", focus: "Lower Strength", details: "Squat, RDL, Core" },
      { day: "Wed", focus: "Rest / Mobility", details: "Zone 2 Cardio" },
      { day: "Thu", focus: "Upper Hypertrophy", details: "DB Press, Pullups, Arms" },
      { day: "Fri", focus: "Lower Power", details: "Cleans, Jumps, Lunges" },
      { day: "Sat", focus: "Active Recovery", details: "Hiking" },
      { day: "Sun", focus: "Rest", details: "Meal Prep" }
    ]
  },
  inseason: {
    title: "In-Season Performance",
    desc: "Low Volume, High Intent.",
    days: [
      { day: "Mon", focus: "Full Body A", details: "Squat, Push, Pull (3x3)" },
      { day: "Tue", focus: "Practice", details: "Sport Specific" },
      { day: "Wed", focus: "Full Body B", details: "Trap Bar DL, Press, Chinup" },
      { day: "Thu", focus: "Practice", details: "Sport Specific" },
      { day: "Fri", focus: "Priming", details: "Jumps, Throws, Core" },
      { day: "Sat", focus: "GAME DAY", details: "Compete" },
      { day: "Sun", focus: "Rest", details: "Sleep & Eat" }
    ]
  }
};

export const GOAL_ADDONS: Record<Goal, { label: string; desc: string; items: string[] }> = {
  loss: { label: "FAT LOSS FOCUS", desc: "Prioritizing volume and lean protein.", items: ["Egg Whites", "Popcorn", "Green Beans"] },
  gain: { label: "MUSCLE GAIN FOCUS", desc: "Prioritizing caloric density.", items: ["Whole Milk", "Bagels", "Olive Oil"] },
  maintain: { label: "MAINTENANCE FOCUS", desc: "Standard balanced performance list.", items: [] }
};

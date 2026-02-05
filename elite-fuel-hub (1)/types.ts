
export type Goal = 'maintain' | 'loss' | 'gain';
export type Season = 'pre' | 'in' | 'post' | 'off';
export type Gender = 'male' | 'female';
export type BudgetTier = 'survival' | 'performance';

export interface AthleteStats {
  gender: Gender;
  age: number;
  weightLbs: number;
  heightFt: number;
  heightIn: number;
  dailyActivity: number; 
  trainingFreq: number;  
  goal: Goal;
  season: Season;
  sport: string;
  position: string;
  hasKitchen: boolean;
  likes?: string;
  dislikes?: string;
}

export interface SavedMeal {
  id: string;
  date: string;
  analysis: string;
  imageUrl?: string;
  protein?: number;
  carbs?: number;
  fats?: number;
  calories?: number;
}

export interface SavedWorkout {
  id: string;
  date: string;
  title: string;
  content: string;
  config: {
    days: number;
    season: Season;
    focus: string;
  };
}

// Added TrainingDay interface for TrainingProgram structure
export interface TrainingDay {
  day: string;
  focus: string;
  details: string;
}

// Added TrainingProgram interface to resolve import error in constants.tsx
export interface TrainingProgram {
  title: string;
  desc: string;
  days: TrainingDay[];
}

// Added GroceryItem interface to resolve import error in constants.tsx
export interface GroceryItem {
  title: string;
  cost: string;
  protein: string[];
  carbs: string[];
  other: string[];
}

export interface SavedGroceryPlan {
  id: string;
  date: string;
  budget: string;
  location: string;
  text: string;
  favoriteFoods?: string;
  preferences?: string;
}

// Added ResearchSource interface for ResearchResult structure
export interface ResearchSource {
  title: string;
  uri: string;
}

// Added ResearchResult interface to resolve import error in components/Research.tsx
export interface ResearchResult {
  text: string;
  sources: ResearchSource[];
}

export interface HistoricalEntry {
  date: string;
  weight: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  actualProtein?: number;
  actualCarbs?: number;
  actualFats?: number;
  actualCalories?: number;
  score: number;
}

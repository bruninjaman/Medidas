export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface UserProfile {
  age: number;
  gender: Gender;
  height: number; // in cm
  activityLevel: ActivityLevel;
}

export interface Measurement {
  id: string;
  date: string; // ISO string
  weight: number; // in kg
  chest?: number;
  waist?: number;
  hips?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  calves?: number;
}

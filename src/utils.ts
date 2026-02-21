import { UserProfile, ActivityLevel } from './types';

export function calculateBMR(profile: UserProfile, weight: number): number {
  // Mifflin-St Jeor Equation
  const { gender, height, age } = profile;
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  
  return bmr;
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  return bmr * multipliers[activityLevel];
}

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentário (Pouco ou nenhum exercício)',
  light: 'Leve (Exercício leve 1-3 dias/semana)',
  moderate: 'Moderado (Exercício moderado 3-5 dias/semana)',
  active: 'Ativo (Exercício pesado 6-7 dias/semana)',
  very_active: 'Muito Ativo (Trabalho físico ou treino 2x/dia)'
};

/**
 * Utility functions for scaling recipe ingredients based on portion/size selection.
 */

type Shape = 'circle' | 'square' | 'rectangle' | 'heart';

/**
 * Map app shape names to database shape names.
 * @param appShape - shape name used in the app
 * @returns shape name as stored in the database
 */
export function mapShapeToDb(appShape: string): string {
  const shapeMap: Record<string, string> = {
    'circle': 'round',
    'square': 'square',
    'rectangle': 'rectangle',
    'heart': 'heart',
  };
  return shapeMap[appShape] || appShape;
}

type IngredientRow = {
  name: string;
  amount: number;
  unit: string;
};

/**
 * Calculate the area of a cake shape based on dimensions.
 * @param shape - 'circle', 'square', 'rectangle', or 'heart'
 * @param diameter_cm - diameter (for circle/square)
 * @param width_cm - width (for square/rectangle)
 * @param length_cm - length (for rectangle)
 * @returns area in cm²
 */
export function calculateArea(
  shape: Shape,
  diameter_cm?: number,
  width_cm?: number,
  length_cm?: number
): number {
  switch (shape) {
    case 'circle': {
      if (!diameter_cm) return 0;
      const radius = diameter_cm / 2;
      return Math.PI * radius * radius;
    }

    case 'square': {
      if (!diameter_cm) return 0;
      // diameter_cm is treated as side length for square
      return diameter_cm * diameter_cm;
    }

    case 'rectangle': {
      if (!width_cm || !length_cm) return 0;
      return width_cm * length_cm;
    }

    case 'heart': {
      // Approximate heart as 0.75 * bounding box (width × length)
      // If only diameter given, treat as proxy for width/height
      if (width_cm && length_cm) {
        return 0.75 * width_cm * length_cm;
      } else if (diameter_cm) {
        return 0.75 * diameter_cm * diameter_cm;
      }
      return 0;
    }

    default:
      return 0;
  }
}

/**
 * Scale ingredients linearly based on portion ratio.
 * @param ingredients - array of ingredient rows with base amounts
 * @param basePortion - original portion count (e.g., recipe made for 6 portions)
 * @param targetPortion - desired portion count (e.g., user selected 8 portions)
 * @returns new array with scaled amounts
 */
export function scaleIngredientsLinear(
  ingredients: IngredientRow[],
  basePortion: number,
  targetPortion: number
): IngredientRow[] {
  if (basePortion <= 0 || targetPortion <= 0) return ingredients;

  const scaleFactor = targetPortion / basePortion;

  return ingredients.map((ing) => ({
    ...ing,
    amount: roundAmount(ing.amount * scaleFactor, ing.unit),
  }));
}

/**
 * Scale ingredients based on area ratio (for size-based scaling).
 * @param ingredients - array of ingredient rows with base amounts
 * @param baseArea - area of the base recipe (cm²)
 * @param targetArea - area of the target size (cm²)
 * @returns new array with scaled amounts
 */
export function scaleIngredientsByArea(
  ingredients: IngredientRow[],
  baseArea: number,
  targetArea: number
): IngredientRow[] {
  if (baseArea <= 0 || targetArea <= 0) return ingredients;

  const scaleFactor = targetArea / baseArea;

  return ingredients.map((ing) => ({
    ...ing,
    amount: roundAmount(ing.amount * scaleFactor, ing.unit),
  }));
}

/**
 * Round ingredient amounts intelligently based on unit.
 * - Grams/ml: round to 1 decimal if < 50, else to nearest integer
 * - Pieces/whole: round to nearest integer
 * - Small amounts: keep 1-2 decimals
 * @param amount - raw amount to round
 * @param unit - unit of measurement
 * @returns rounded amount
 */
export function roundAmount(amount: number, unit: string): number {
  if (amount < 0) return 0;

  const unitLower = unit.toLowerCase();

  // Whole pieces, items, etc. → round to integer
  if (['piece', 'pieces', 'item', 'items', 'whole', 'egg', 'eggs'].includes(unitLower)) {
    return Math.round(amount);
  }

  // Very small amounts (< 1) → keep 2 decimals
  if (amount < 1) {
    return Math.round(amount * 100) / 100;
  }

  // Medium amounts (1-50) → keep 1 decimal
  if (amount < 50) {
    return Math.round(amount * 10) / 10;
  }

  // Large amounts (>= 50) → round to integer
  return Math.round(amount);
}

/**
 * Determine which dimension field to use for lookup in size_portion_guides.
 * When user enters one number in "size" mode, map it to the appropriate DB column.
 * @param shape - the selected shape
 * @returns the column name to query ('diameter_cm', 'width_cm', or 'length_cm')
 */
export function getDimensionFieldForShape(shape: Shape): string {
  switch (shape) {
    case 'circle':
      return 'diameter_cm';
    case 'square':
      return 'width_cm'; // For square, width = length
    case 'rectangle':
      return 'length_cm'; // Use length as primary dimension
    case 'heart':
      return 'width_cm'; // Approximate heart by width
    default:
      return 'diameter_cm';
  }
}

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { supabase } from '../../lib/supabase';
import { styles } from './RecipeScreen.styles';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateArea, scaleIngredientsByArea } from '../../lib/scalingUtils';

type IngredientRow = {
  name: string;
  amount: number;
  unit: string;
};

type RecipeWithIngredients = {
  id: number;
  name: string;
  instructions: string | null;
  estimated_time: number | null;
  ingredients: IngredientRow[];
  recipe_size_ref: Array<{
    shape: string;
    area_cm2: number | null;
  }> | null;
};

type Section = {
  title: string;
  recipe: RecipeWithIngredients | null;
};

export default function RecipeScreen({ route }: any) {
  const {
    caketype,
    caketype2,
    layers = [],
    outerLayer,
    selectedPortionSize,
    portionSize,
    portionSize2,
    selectedShape,
  }: {
    caketype?: string;
    caketype2?: string;
    layers?: string[];
    outerLayer?: string;
    selectedPortionSize?: 'portions' | 'size';
    portionSize?: string;
    portionSize2?: string;
    selectedShape?: 'circle' | 'square' | 'rectangle' | 'heart';
  } = route.params ?? {};

  const [recipesByName, setRecipesByName] = useState<Record<string, RecipeWithIngredients>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const names = Array.from(
          new Set(
            [caketype, caketype2, ...layers, outerLayer].filter(
              (n): n is string => !!n && n !== 'None'
            )
          )
        );

        if (!names.length) {
          setRecipesByName({});
          return;
        }

        // Fetch recipes with their ingredients
        const { data, error } = await supabase
          .from('recipes')
          .select(
            `id, name, instructions, estimated_time,
             recipe_ingredients(amount, unit, ingredients(name))`
          )
          .in('name', names);

        if (error) throw error;

        // Fetch size refs for these recipes
        const recipeIds = (data ?? []).map((r: any) => r.id);
        let sizeRefsByRecipeId: Record<number, any> = {};

        if (recipeIds.length > 0) {
          const { data: sizeRefs } = await supabase
            .from('recipe_size_refs')
            .select('recipe_id, shape, area_cm2')
            .in('recipe_id', recipeIds);

          sizeRefsByRecipeId = {};
          for (const ref of (sizeRefs ?? [])) {
            sizeRefsByRecipeId[ref.recipe_id] = ref;
          }
        }

        // Calculate user's target size once (all recipes scale to same target)
        let userArea: number | null = null;

        if (selectedPortionSize && portionSize && selectedShape) {
          if (selectedPortionSize === 'size') {
            // Size mode: compute the area directly from the user's input.
            const dimension1 = parseFloat(portionSize);
            
            if (dimension1 > 0) {
              if (selectedShape === 'circle') {
                // Circle: diameter
                userArea = calculateArea('circle', dimension1);
              } else if (selectedShape === 'square') {
                // Square: side length (treated as diameter in calculateArea)
                userArea = calculateArea('square', dimension1);
              } else if (selectedShape === 'rectangle') {
                // Rectangle: length and width
                const dimension2 = parseFloat(portionSize2 || '0');
                if (dimension2 > 0) {
                  userArea = calculateArea('rectangle', undefined, dimension1, dimension2);
                }
              } else if (selectedShape === 'heart') {
                // Heart: calculated exactly like circle (π × r²)
                userArea = calculateArea('heart', dimension1);
              }
            }
          } else {
            // Portions mode: look up the matching row in size_portion_guides.
            try {
              const { data: sizeData, error: sizeError } = await supabase
                .from('size_portion_guides')
                .select('area_cm2')
                .eq('shape', selectedShape)
                .eq('portions', parseInt(portionSize, 10))
                .maybeSingle();

              if (!sizeError && sizeData?.area_cm2) {
                userArea = sizeData.area_cm2;
              }
            } catch (e: any) {
              setError(`Error looking up user size: ${e.message}`);
            }
          }
        }

        // Transform recipes and apply scaling
        const map: Record<string, RecipeWithIngredients> = {};
        for (const row of (data ?? []) as any[]) {
          let ingredients: IngredientRow[] = (row.recipe_ingredients ?? []).map((ri: any) => ({
            name: ri.ingredients?.name ?? 'Unknown',
            amount: ri.amount,
            unit: ri.unit,
          }));

          // Apply scaling if user size is known and recipe has a reference area
          if (userArea !== null && userArea > 0 && sizeRefsByRecipeId[row.id]) {
            const recipeArea = sizeRefsByRecipeId[row.id].area_cm2;
            if (recipeArea && recipeArea > 0) {
              ingredients = scaleIngredientsByArea(ingredients, recipeArea, userArea);
            }
          }

          map[row.name] = {
            id: row.id,
            name: row.name,
            instructions: row.instructions ?? null,
            estimated_time: row.estimated_time ?? null,
            recipe_size_ref: sizeRefsByRecipeId[row.id] ? [sizeRefsByRecipeId[row.id]] : null,
            ingredients,
          };
        }
        setRecipesByName(map);
      } catch (e: any) {
        console.error('Error loading recipes:', e);
        setError(e?.message ?? 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [caketype, caketype2, outerLayer, JSON.stringify(layers), selectedPortionSize, portionSize, portionSize2, selectedShape]);

  const sections: Section[] = useMemo(() => {
    const result: Section[] = [];

    if (caketype) {
      result.push({ title: 'Cake base', recipe: recipesByName[caketype] ?? null });
    }
    if (caketype2) {
      result.push({ title: 'Second cake base', recipe: recipesByName[caketype2] ?? null });
    }

    // Group layer positions by recipe name so duplicates render once.
    const positionsByName = new Map<string, number[]>();
    layers.forEach((name, idx) => {
      if (!name || name === 'None') return;
      const arr = positionsByName.get(name) ?? [];
      arr.push(idx + 1);
      positionsByName.set(name, arr);
    });

    for (const [name, positions] of positionsByName.entries()) {
      const title =
        positions.length === 1
          ? `Layer ${positions[0]}`
          : `Layers ${positions.join(', ')}`;
      result.push({ title, recipe: recipesByName[name] ?? null });
    }

    if (outerLayer) {
      result.push({ title: 'Outer layer', recipe: recipesByName[outerLayer] ?? null });
    }

    return result;
  }, [caketype, caketype2, layers, outerLayer, recipesByName]);

  // Calculate shopping list by combining all ingredients
  const shoppingList: IngredientRow[] = useMemo(() => {
    const ingredientMap = new Map<string, { amount: number; unit: string }>();

    // Collect all ingredients from all recipes
    sections.forEach((section) => {
      if (section.recipe && section.recipe.ingredients) {
        section.recipe.ingredients.forEach((ing) => {
          const key = `${ing.name}|${ing.unit}`;
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            existing.amount += ing.amount;
          } else {
            ingredientMap.set(key, { amount: ing.amount, unit: ing.unit });
          }
        });
      }
    });

    // Convert to array and sort
    return Array.from(ingredientMap.entries())
      .map(([key, value]) => ({
        name: key.split('|')[0],
        amount: value.amount,
        unit: value.unit,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sections]);

  const Block = ({
    title,
    recipe,
  }: {
    title: string;
    recipe: RecipeWithIngredients | null;
  }) => (
    <View>
      {!recipe ? (
        <Text style={styles.noRecepieFoundText}>No recipe found.</Text>
      ) : (
        <View style={styles.recipeContainer}>
          <View style={styles.recepieNameContainer}>
          <Text style={styles.recepieNameText}>{recipe.name}</Text>
          </View>
          <View style={styles.instructionsContainerRecipe}>
          <View style={styles.ingredientContainerRecipe}>
            <Text style={styles.ingredientHeader}>Ingredients</Text>
            {recipe.ingredients.length ? (
              recipe.ingredients.map((ing, idx) => (
                <Text style={styles.ingredientsRecipe} key={idx}>
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  <Text style={styles.ingredientAmount}> {Math.ceil(ing.amount)} {ing.unit}</Text>
                </Text>
              ))
            ) : (
              <Text style={styles.ingredientName}>No ingredients added.</Text>
            )}
          </View>
          <Text style={styles.ingredientHeader}>Instructions</Text>
          <Text style={styles.instructionText}>
            {recipe.instructions ?? 'No instructions.'}
          </Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={['#FFF5F0', '#FFFAF7', '#FBEFF4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, backgroundColor: '#FFF', shadowOpacity: 0.05 }}
    >
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
          <Header />
        
          <Text style={styles.title}>All Recipes</Text>
          <Text style={styles.title2}>Combined shopping list and recipes</Text>
          {loading ? (
            <ActivityIndicator />
          ) : error ? (
            <Text>Error: {error}</Text>
          ) : (
            <View>
              {shoppingList.length > 0 && (
                <View style={styles.shoppingListContainer}>
                  <View style={styles.shoppingListHeader}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" >
                      <path d="M12.4967 9.16441L11.6636 16.6626" stroke="#FF9ECD" stroke-width="1.66626" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M15.8296 9.16442L12.4971 3.33252" stroke="#FF9ECD" stroke-width="1.66626" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M1.66602 9.16441H18.3286" stroke="#FF9ECD" stroke-width="1.66626" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M2.91602 9.16441L4.24902 15.3296C4.32692 15.7116 4.53632 16.0542 4.84078 16.2978C5.14524 16.5413 5.52547 16.6704 5.91528 16.6626H14.0799C14.4698 16.6704 14.85 16.5413 15.1544 16.2978C15.4589 16.0542 15.6683 15.7116 15.7462 15.3296L17.1625 9.16441" stroke="#FF9ECD" stroke-width="1.66626" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M3.74902 12.9135H16.246" stroke="#FF9ECD" stroke-width="1.66626" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M4.16553 9.16442L7.49804 3.33252" stroke="#FF9ECD" stroke-width="1.66626" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M7.49805 9.16441L8.33118 16.6626" stroke="#FF9ECD" stroke-width="1.66626" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <Text style={styles.shoppingListTitle}>Shopping List</Text>
                  </View>
                  <View style={styles.ingredientsList}>
                    {shoppingList.map((ing, idx) => (
                      <View style={styles.ingredients} key={idx}>
                        <Text style={styles.ingredientName}>{ing.name}</Text>
                        <Text style={styles.ingredientAmount}>
                          {Math.ceil(ing.amount)} {ing.unit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              <TouchableOpacity 
                style={styles.tipsHeader}
                onPress={() => setShowTips(!showTips)}
              >
                <Text style={styles.tipsHeaderText}>
                  {showTips ? '▼ ' : '▶ '}
                </Text>
                <Text style={styles.tipsHeaderText}>Instructions & Tips</Text>
              </TouchableOpacity>
              {showTips && (
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipTitle}>How to Build Your Cake:</Text>
                  <Text style={styles.tipText}>
                    1. <Text style={styles.tipBold}>Cutting the Sponge Cake:</Text> Carefully cut your baked sponge cake into layers using a serrated knife or cake leveler. Make horizontal cuts to create even layers.
                  </Text>
                  <Text style={styles.tipText}>
                    2. <Text style={styles.tipBold}>Applying Syrup:</Text> Brush each layer with syrup (simple syrup or flavored syrup) to keep the cake moist and prevent it from being dry. This adds flavor and moisture to your final creation.
                  </Text>
                  <Text style={styles.tipText}>
                    3. <Text style={styles.tipBold}>What is a Piping Bag?</Text> A piping bag is a cone-shaped tool used to apply frosting, cream, or other fillings with precision. Fill it with your mixture and squeeze to create decorative patterns and controlled portions.
                  </Text>
                  <Text style={styles.tipText}>
                    4. <Text style={styles.tipBold}>Assembly:</Text> Start with your cake base, add your chosen layers (cream, filling, ganache), and finish with your outer coating and decorations.
                  </Text>
                  <Text style={styles.tipText}>
                    5. <Text style={styles.tipBold}>Refrigeration:</Text> Keep your cake refrigerated between assembly steps for best results and easier handling.
                  </Text>
                </View>
              )}
              {sections.map((s, idx) => (
                <Block key={`${s.title}-${idx}`} title={s.title} recipe={s.recipe} />
              ))}
            </View>
          )}
        </ScrollView>
        <Footer />
      </View>
    </LinearGradient>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
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
    selectedShape,
  }: {
    caketype?: string;
    caketype2?: string;
    layers?: string[];
    outerLayer?: string;
    selectedPortionSize?: 'portions' | 'size';
    portionSize?: string;
    selectedShape?: 'circle' | 'square' | 'rectangle' | 'heart';
  } = route.params ?? {};

  const [recipesByName, setRecipesByName] = useState<Record<string, RecipeWithIngredients>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            // Only circle is supported for now — other shapes need width + length inputs.
            if (selectedShape === 'circle') {
              const diameter = parseFloat(portionSize);
              if (diameter > 0) {
                userArea = calculateArea('circle', diameter);
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
  }, [caketype, caketype2, outerLayer, JSON.stringify(layers), selectedPortionSize, portionSize, selectedShape]);

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

  const Block = ({
    title,
    recipe,
  }: {
    title: string;
    recipe: RecipeWithIngredients | null;
  }) => (
    <View>
      <Text style={styles.categoryText}>{title}</Text>

      {!recipe ? (
        <Text style={styles.noRecepieFoundText}>No recipe found.</Text>
      ) : (
        <View>
          <Text style={styles.recepieNameText}>{recipe.name}</Text>
          <Text style={styles.portionsAndTimeText}>
            Time: {recipe.estimated_time ?? '—'} min
          </Text>
          <View style={styles.ingredientBox}>
            <Text style={styles.ingredientHeader}>Ingredients</Text>
            {recipe.ingredients.length ? (
              recipe.ingredients.map((ing, idx) => (
                <Text style={styles.ingredientText} key={idx}>
                  • {ing.name}: {ing.amount} {ing.unit}
                </Text>
              ))
            ) : (
              <Text>No ingredients added.</Text>
            )}
          </View>
          <Text style={styles.instructiontHeader}>Instructions</Text>
          <Text style={styles.instructionText}>
            {recipe.instructions ?? 'No instructions.'}
          </Text>
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

          {loading ? (
            <ActivityIndicator />
          ) : error ? (
            <Text>Error: {error}</Text>
          ) : (
            <View>
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

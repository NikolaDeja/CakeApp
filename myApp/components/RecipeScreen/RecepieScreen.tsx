import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import Header from '../Header.tsx/Header';
import { supabase } from '../../lib/supabase';
import { styles } from './RecipeScreen.styles';
import { LinearGradient } from 'expo-linear-gradient';

type RecipeRow = {
  id: number;
  name: string;
  type: string | null;
  portions: number;
  instructions: string | null;
  estimated_time: number | null;
};

type IngredientRow = {
  name: string;
  amount: number;
  unit: string;
};

type GroupedLayerRecipe = {
  recipe: RecipeRow;
  layers: string[]; // e.g. ["Layer 1", "Layer 3"]
  ingredients: IngredientRow[];
};

export default function RecipeScreen({ route }: any) {
  const { caketype, layer1, layer2, layer3 } = route.params;

  const [cakeRecipe, setCakeRecipe] = useState<RecipeRow | null>(null);
  const [cakeIngredients, setCakeIngredients] = useState<IngredientRow[]>([]);

  const [layer1Recipe, setLayer1Recipe] = useState<RecipeRow | null>(null);
  const [layer2Recipe, setLayer2Recipe] = useState<RecipeRow | null>(null);
  const [layer3Recipe, setLayer3Recipe] = useState<RecipeRow | null>(null);

  const [layerIngredientsById, setLayerIngredientsById] = useState<Record<number, IngredientRow[]>>(
    {}
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOneRecipe = async (type: string, name: string) => {
      const { data, error } = await supabase
        .from('recipe')
        .select('id,name,type,portions,instructions,estimated_time')
        .eq('type', type)
        .eq('name', name)
        .maybeSingle();

      if (error) throw error;
      return data as RecipeRow | null;
    };

    const fetchIngredients = async (recipeId: number) => {
      const { data, error } = await supabase
        .from('recepie_ingredients')
        .select('amount, unit, ingredients(name)')
        .eq('recepie_id', recipeId);

      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        name: row.ingredients?.name ?? 'Unknown',
        amount: row.amount,
        unit: row.unit,
      })) as IngredientRow[];
    };

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Base cake
        const cake = await fetchOneRecipe('cake', caketype);
        setCakeRecipe(cake);
        setCakeIngredients(cake?.id ? await fetchIngredients(cake.id) : []);

        // Layers (cream)
        const l1 = await fetchOneRecipe('cream', layer1);
        const l2 =
          layer2 && layer2 !== 'None' ? await fetchOneRecipe('cream', layer2) : null;
        const l3 =
          layer3 && layer3 !== 'None' ? await fetchOneRecipe('cream', layer3) : null;

        setLayer1Recipe(l1);
        setLayer2Recipe(l2);
        setLayer3Recipe(l3);

        // Fetch ingredients only once per unique layer recipe id
        const uniqueLayerIds = Array.from(
          new Set([l1?.id, l2?.id, l3?.id].filter(Boolean) as number[])
        );

        const entries = await Promise.all(
          uniqueLayerIds.map(async (id) => [id, await fetchIngredients(id)] as const)
        );

        const byId: Record<number, IngredientRow[]> = {};
        for (const [id, ings] of entries) byId[id] = ings;
        setLayerIngredientsById(byId);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [caketype, layer1, layer2, layer3]);

  const groupedLayerRecipes: GroupedLayerRecipe[] = useMemo(() => {
    const uses: Array<{ layer: string; recipe: RecipeRow }> = [];
    if (layer1Recipe) uses.push({ layer: 'Layer 1', recipe: layer1Recipe });
    if (layer2Recipe) uses.push({ layer: 'Layer 2', recipe: layer2Recipe });
    if (layer3Recipe) uses.push({ layer: 'Layer 3', recipe: layer3Recipe });

    const grouped = uses.reduce<Record<number, { recipe: RecipeRow; layers: string[] }>>(
      (acc, u) => {
        const id = u.recipe.id;
        if (!acc[id]) acc[id] = { recipe: u.recipe, layers: [] };
        acc[id].layers.push(u.layer);
        return acc;
      },
      {}
    );

    return Object.values(grouped).map(({ recipe, layers }) => ({
      recipe,
      layers,
      ingredients: layerIngredientsById[recipe.id] ?? [],
    }));
  }, [layer1Recipe, layer2Recipe, layer3Recipe, layerIngredientsById]);

  const Block = ({
    title,
    recipe,
    ingredients,
  }: {
    title: string;
    recipe: RecipeRow | null;
    ingredients: IngredientRow[];
  }) => (

    <View>
      <Text style={styles.categoryText}>{title}</Text>

      {!recipe ? (
        <Text style={styles.noRecepieFoundText}>No recipe found.</Text>
      ) : (
        <View>
          <Text style={styles.recepieNameText}>{recipe.name}</Text>
          <Text style={styles.portionsAndTimeText} >
            Portions: {recipe.portions} • Time: {recipe.estimated_time ?? '—'} min
          </Text>
            <View style={styles.ingredientBox}>
          <Text style={styles.ingredientHeader}>Ingredients</Text>
          {ingredients.length ? (
            ingredients.map((ing, idx) => (
              <Text style={styles.ingredientText} key={idx}>
                • {ing.name}: {ing.amount} {ing.unit}
              </Text>
            ))
          ) : (
            <Text>No ingredients added.</Text>
          )}
            </View>
          <Text style={styles.instructiontHeader}>Instructions</Text>
          <Text style={styles.instructionText}>{recipe.instructions ?? 'No instructions.'}</Text>
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient
            colors={['#FFF5F0', '#FFFAF7', '#FBEFF4']}
            start={{ x: 0, y: 0 }}   // top-left
            end={{ x: 1, y: 1 }}     // bottom-right
            style={{ flex: 1 ,backgroundColor: '#FFF',
            shadowOpacity: 0.05}}
            >

    <ScrollView>
      <Header />

      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : (
        <View>
          <Block title="Cake recipe" recipe={cakeRecipe} ingredients={cakeIngredients} />

          {/* Grouped layers: if same cream chosen multiple times, it shows once */}
          {groupedLayerRecipes.map((g) => (
            <Block
              key={g.recipe.id}
              title={`Flavour (used in: ${g.layers.join(', ')})`}
              recipe={g.recipe}
              ingredients={g.ingredients}
            />
          ))}
        </View>
      )}
    
    </ScrollView>
    </LinearGradient>
  );
}


import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { styles } from './AddRecipeScreen.styles';
import Header from '../Header.tsx/Header';
import { LinearGradient } from 'expo-linear-gradient';

type IngredientInput = {
  name: string;
  amount: string;
  unit: string;
};

export default function AddRecipeScreen({ navigation }: any) {
  const [recipeName, setRecipeName] = useState('');
  const [recipeType, setRecipeType] = useState<'cake' | 'cream' | 'filling'>('cream');
  const [portions, setPortions] = useState('8');
  const [estimatedTime, setEstimatedTime] = useState('30');
  const [instructions, setInstructions] = useState('');
  const [instructionsHeight, setInstructionsHeight] = useState(80);
  const [selectedPortionSize, setSelectedPortionSize] = useState<'portions' | 'size' | ''>('');

  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { name: '', amount: '', unit: 'g' },
  ]);

  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    if (!recipeName.trim()) return false;

    const p = Number(portions);
    if (!Number.isFinite(p) || p <= 0) return false;

    const hasValidIngredient = ingredients.some((i) => {
      const name = i.name.trim();
      const amount = Number(String(i.amount).replace(',', '.'));
      const unit = i.unit.trim();
      return name.length > 0 && Number.isFinite(amount) && amount > 0 && unit.length > 0;
    });

    return hasValidIngredient;
  }, [recipeName, portions, ingredients]);

  const updateIngredient = (index: number, patch: Partial<IngredientInput>) => {
    setIngredients((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const addIngredientRow = () => {
    setIngredients((prev) => [...prev, { name: '', amount: '', unit: 'g' }]);
  };

  const removeIngredientRow = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const saveRecipe = async () => {
    if (!canSave || saving) return;

    setSaving(true);

    try {
      const validIngredients = ingredients
        .map((i) => ({
          name: i.name.trim(),
          amount: Number(String(i.amount).replace(',', '.')),
          unit: i.unit.trim(),
        }))
        .filter((i) => i.name && Number.isFinite(i.amount) && i.amount > 0 && i.unit);

      if (validIngredients.length === 0) {
        Alert.alert('Missing ingredients', 'Add at least one valid ingredient.');
        return;
      }

      // 1) Insert recipe row
      const { data: recipeRow, error: recipeError } = await supabase
        .from('recipe')
        .insert([
          {
            name: recipeName.trim(),
            type: recipeType,
            portions: Number(portions),
            estimated_time: estimatedTime ? Number(estimatedTime) : null,
            instructions: instructions.trim() || null,
          },
        ])
        .select('id')
        .single();

      if (recipeError) throw recipeError;

      const newRecipeId = recipeRow.id as number;

      // 2) Insert ingredients and join rows
      for (const ing of validIngredients) {
        const cleanName = ing.name;

        // find ingredient by name
        const { data: existing, error: findErr } = await supabase
          .from('ingredients')
          .select('id')
          .eq('name', cleanName)
          .maybeSingle();

        if (findErr) throw findErr;

        let ingredientId: number | undefined = existing?.id;

        // create ingredient if missing
        if (!ingredientId) {
          const { data: created, error: createErr } = await supabase
            .from('ingredients')
            .insert([{ name: cleanName, default_unit: ing.unit }])
            .select('id')
            .single();

          if (createErr) throw createErr;
          ingredientId = created.id as number;
        }

        // insert join row
        const { error: joinErr } = await supabase.from('recepie_ingredients').insert([
          {
            recepie_id: newRecipeId,
            ingredient_id: ingredientId,
            amount: ing.amount,
            unit: ing.unit,
          },
        ]);

        if (joinErr) throw joinErr;
      }

      Alert.alert('Success', 'Recipe saved!');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Something went wrong while saving.');
    } finally {
      setSaving(false);
    }
  };

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
        <Text style={styles.topText}>Add Your Recipe</Text>

        <View style={styles.stepBox}>
          <Text style={styles.stepsText}>Recipe name</Text>
          <TextInput style={styles.fildBox} value={recipeName} onChangeText={setRecipeName} placeholder="e.g. Chocolate cream" />
        </View>

        <View style={styles.stepBox}>
        <Text style={styles.stepsText}>Type (write one: caketype / cream / filling)</Text>
        <TextInput style={styles.fildBox}
          value={recipeType}
          onChangeText={(t) => setRecipeType(t as any)}
          placeholder="e.g. cream"
        />
        </View>
        
        <View style={styles.stepBox}>
          <Text style={styles.stepsText}>Portions or size</Text>
          <View style={styles.buttonsContainer}>
                          <Pressable
                            style={({ pressed }) => [
                              styles.optionsButtons,
                              (pressed || selectedPortionSize === 'portions') && styles.optionsButtonsHover,
                            ]}
                            onPress={() => {
                              setSelectedPortionSize('portions');
                            }}
                          >
                            <Text style={styles.optionsButtonsText}>Portions</Text>
                          </Pressable>
                          <Pressable
                            style={({ pressed }) => [
                              styles.optionsButtons,
                              (pressed || selectedPortionSize === 'size') && styles.optionsButtonsHover,
                            ]}
                            onPress={() => {
                              setSelectedPortionSize('size');
                            }}
                          >
                            <Text style={styles.optionsButtonsText}>Size (cm)</Text>
                          </Pressable>
                          </View>
                          <TextInput
                              style={[styles.fildBox, styles.stepsText]}
                              placeholder="16"
                              keyboardType="numeric"
                              />
                        
          </View>
        <View style={styles.stepBox}> 
        <Text style={styles.stepsText}>Estimated time (minutes)</Text>
        <TextInput style={styles.fildBox} value={estimatedTime} onChangeText={setEstimatedTime} keyboardType="numeric" placeholder="30" />
        </View>

        <View style={styles.stepBox}> 
        <Text style={styles.stepsText}>Instructions</Text>
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Write steps..."
          multiline
          onContentSizeChange={(e) =>
            setInstructionsHeight(e.nativeEvent.contentSize.height)
          }
          style={[
            styles.fildBox,
            {
              height: Math.min(300, Math.max(80, instructionsHeight)),
            },
          ]}
        />
        </View>

        <View style={styles.stepBox}>
        <Text style={styles.stepsText}>Ingredients</Text>
        {ingredients.map((ing, idx) => (
          <View key={idx}>
            <View style={styles.ingredientHeader}>
              <Text style={styles.ingedientText}>Ingredient {idx + 1}</Text>
              {ingredients.length > 1 ? (
                <Pressable style={styles.removeButton} onPress={() => removeIngredientRow(idx)}>
                  <Text style={styles.removeButtonText}>X</Text>
                </Pressable>
              ) : null}
            </View>
            <View style={styles.fildBox}>
              <TextInput
                value={ing.name}
                onChangeText={(t) => updateIngredient(idx, { name: t })}
                placeholder="e.g. sugar"
              />

              <TextInput
                value={ing.amount}
                onChangeText={(t) => updateIngredient(idx, { amount: t })}
                placeholder="amount"
                keyboardType="numeric"
              />

              <TextInput
                value={ing.unit}
                onChangeText={(t) => updateIngredient(idx, { unit: t })}
                placeholder="unit (gr/ml/piece)"
              />
            </View>

          
          </View>
      
        ))}
          <View>
            <Pressable style={styles.AddButton} onPress={addIngredientRow}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" style={styles.addIcon}>
              <path d="M3.33252 7.99805H12.6636" stroke="white" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7.99805 3.33252V12.6636" stroke="white" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <Text style={styles.AddButtonText}>Add ingredient</Text>
            </Pressable>
          </View>
        </View>

        <Pressable  style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed,]} 
        disabled={!canSave || saving} onPress={saveRecipe}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save recipe'}</Text>
        </Pressable>
      </ScrollView>
      </LinearGradient>
      
  );
}

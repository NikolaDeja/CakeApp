import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { styles } from './AddRecipeScreen.styles';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { LinearGradient } from 'expo-linear-gradient';
import { SelectList } from 'react-native-dropdown-select-list';

type IngredientInput = {
  name: string;
  amount: string;
  unit: string;
};

type RecipeType = {
  id: number;
  code: string;
  name?: string;
};

export default function AddRecipeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipeName, setRecipeName] = useState('');
  const [recipeTypeId, setRecipeTypeId] = useState<number | null>(null);
  const [recipeTypes, setRecipeTypes] = useState<RecipeType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [selectedPortionSize, setSelectedPortionSize] = useState<'portions' | 'size' | ''>('');
  const [selectedShape, setSelectedShape] = useState<'circle' | 'square' | 'rectangle' | 'heart' | ''>('');
  const [portionSize, setPortionSize] = useState('');
  const [portionSize2, setPortionSize2] = useState('');
  const [portionSizeError, setPortionSizeError] = useState<string | null>(null);
  const [portionSize2Error, setPortionSize2Error] = useState<string | null>(null);
  const [portions, setPortions] = useState('8');
  const [allergensList, setAllergensList] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [allIngredients, setAllIngredients] = useState<Array<{ id: number; name: string }>>([]);
  const [instructions, setInstructions] = useState('');
  const [instructionsHeight, setInstructionsHeight] = useState(80);
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { name: '', amount: '', unit: 'g' },
  ]);

  const [saving, setSaving] = useState(false);

  // Fetch recipe types on mount
  useEffect(() => {
    const fetchRecipeTypes = async () => {
      try {
        setLoadingTypes(true);
        const { data, error } = await supabase
          .from('recipe_types')
          .select('id, code')
          .order('code');

        if (error) throw error;

        setRecipeTypes(data || []);
        // Set first type as default
        if (data && data.length > 0) {
          setRecipeTypeId(data[0].id);
        }
      } catch (e: any) {
        console.error('Error loading recipe types:', e);
        Alert.alert('Error', 'Failed to load recipe types');
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchRecipeTypes();
  }, []);

  // Fetch allergens on mount
  useEffect(() => {
    const fetchAllergens = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('allergens')
          .select('name')
          .order('name', { ascending: true });

        if (error) throw error;
        setAllergensList((data ?? []).map((a: any) => a.name));
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load allergens');
      } finally {
        setLoading(false);
      }
    };

    fetchAllergens();
  }, []);

  // Fetch all ingredients on mount
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const { data, error } = await supabase
          .from('ingredients')
          .select('id, name')
          .order('name', { ascending: true });

        if (error) throw error;
        setAllIngredients(data || []);
      } catch (e: any) {
        console.error('Error loading ingredients:', e);
      }
    };

    fetchIngredients();
  }, []);

  const canSave = useMemo(() => {
    if (!recipeName.trim()) return false;
    if (!recipeTypeId) return false;

    const p = Number(portions);
    if (!Number.isFinite(p) || p <= 0) return false;

    const hasValidIngredient = ingredients.some((i) => {
      const name = i.name.trim();
      const amount = Number(String(i.amount).replace(',', '.'));
      const unit = i.unit.trim();
      return name.length > 0 && Number.isFinite(amount) && amount > 0 && unit.length > 0;
    });

    return hasValidIngredient;
  }, [recipeName, recipeTypeId, portions, ingredients]);

  const updateIngredient = (index: number, patch: Partial<IngredientInput>) => {
    setIngredients((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const addIngredientRow = () => {
    setIngredients((prev) => [...prev, { name: '', amount: '', unit: 'g' }]);
  };

  const addNewIngredient = (idx: number) => {
    const ingredientName = ingredients[idx].name.trim();
    
    if (!ingredientName) {
      Alert.alert('Error', 'Please enter an ingredient name');
      return;
    }

    // Check if ingredient already exists in the list
    const exists = allIngredients.some((ing) => ing.name.toLowerCase() === ingredientName.toLowerCase());
    
    if (exists) {
      Alert.alert('Already Exists', `"${ingredientName}" is already in the ingredients list.`);
      return;
    }

    // Ingredient will be created during save
    Alert.alert('Success', `"${ingredientName}" will be added as a new ingredient.`);
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

      const { data: recipeRow, error: recipeError } = await supabase
        .from('recipes')
        .insert([
          {
            name: recipeName.trim(),
            recipe_type_id: recipeTypeId,
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
        const { error: joinErr } = await supabase.from('recipe_ingredients').insert([
          {
            recipe_id: newRecipeId,
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

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((item) => item !== allergen)
        : [...prev, allergen]
    );
  };

  return (
      <LinearGradient
            //colors={['#FFF5F0', '#FFFAF7', '#FBEFF4']}
            colors={[ '#FFF4ED', '#FEF5EF', '#FEF6F1', '#FDF7F3', '#FCF7F4', '#FBF8F6', '#FBF9F8', '#FAFAFA', '#FBF7F9', '#FCF4F7', '#FCF1F6', '#FDEDF4', '#FEEAF3', '#FEE7F1', '#FFE4F0' ]}
            start={{ x: 0, y: 0 }}   // top-left
            end={{ x: 1, y: 1 }}     // bottom-right
            style={{ flex: 1 ,backgroundColor: '#FFF',
            shadowOpacity: 0.05}}
            >
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
           <Header />
        <Text style={styles.topText}>Add Your Recipe</Text>

        <View style={styles.stepBox}>
          <Text style={styles.stepsText}>Recipe name</Text>
          <TextInput style={styles.fildBox} value={recipeName} onChangeText={setRecipeName} placeholder="e.g. Chocolate cream" />
        </View>

        <View style={styles.stepBox}>
        <Text style={styles.stepsText}>Recipe Type</Text>
        {loadingTypes ? (
          <Text style={styles.fildText}>Loading types...</Text>
        ) : (
          <SelectList
            data={recipeTypes.map((type) => ({
              key: String(type.id),
              value: type.code.charAt(0).toUpperCase() + type.code.slice(1).replace(/_/g, ' '),
            }))}
            setSelected={(value: string) => setRecipeTypeId(Number(value))}
            placeholder="Select a type"
            boxStyles={styles.filedBox}
            inputStyles={styles.fildText}
          />
        )}
        </View>
        <View style={styles.stepBox}>
          <Text style={styles.stepsText}>Shape</Text>
          <View style={styles.buttonsContainer}>
            <Pressable style={({pressed}) =>[
              styles.optionsButtons, 
              (pressed || selectedShape === 'circle') && styles.optionsButtonsHover]}
              onPress={() => {
                setSelectedShape('circle');
                setPortionSize2('');
                setPortionSize2Error(null);
              }}
            >
              <Text style={styles.optionsButtonsText}>Circle</Text>
            </Pressable>
            <Pressable 
            style={({pressed}) =>[
              styles.optionsButtons, 
              (pressed || selectedShape === 'square') && styles.optionsButtonsHover]} 
              onPress={() => {
                setSelectedShape('square');
                setPortionSize2('');
                setPortionSize2Error(null);
              }}
            >
              <Text style={styles.optionsButtonsText}>Square</Text>
            </Pressable>
          </View>
          <View style={styles.buttonsContainer}>
            <Pressable style={({pressed}) =>[
              styles.optionsButtons, 
              (pressed || selectedShape === 'rectangle') && styles.optionsButtonsHover]}
              onPress={() => setSelectedShape('rectangle')}
            >
              <Text style={styles.optionsButtonsText}>Rectangle</Text>
            </Pressable>
            <Pressable style={({pressed}) =>[
              styles.optionsButtons, 
              (pressed || selectedShape === 'heart') && styles.optionsButtonsHover]} 
              onPress={() => {
                setSelectedShape('heart');
                setPortionSize2('');
                setPortionSize2Error(null);
              }}
            >
              <Text style={styles.optionsButtonsText}>Heart</Text>
            </Pressable>
          </View>
        </View>
        
        <View style={styles.stepBox}>
          <Text style={styles.stepsText}>Step 2: Portions or size</Text>
          <View style={styles.buttonsContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.optionsButtons,
                (pressed || selectedPortionSize === 'portions') && styles.optionsButtonsHover,
              ]}
              onPress={() => {
                setSelectedPortionSize('portions');
                setPortionSizeError(null);
                setPortionSize2('');
                setPortionSize2Error(null);
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
                setPortionSizeError(null);
                setPortionSize2('');
                setPortionSize2Error(null);
              }}
            >
              <Text style={styles.optionsButtonsText}>Size (cm)</Text>
            </Pressable>
          </View>
        
          {selectedPortionSize && (
            <>
              <TextInput
                style={[styles.filedBox, styles.fildText]}
                placeholder={selectedPortionSize === 'portions' ? "e.g. 8, 12, 16" : selectedShape === 'rectangle' ? "e.g. 20 (length)" : "e.g. 20, 25, 30"}
                keyboardType="numeric"
                value={portionSize}
                onChangeText={(text) => {
                  // Remove non-digits
                  const digits = text.replace(/[^0-9]/g, '');
                  
                  if (digits === '') {
                    setPortionSize('');
                    setPortionSizeError(null);
                  } else {
                    const num = parseInt(digits, 10);
                    
                    // Validate: must be integer > 0
                    if (num > 0) {
                      setPortionSize(String(num));
                      setPortionSizeError(null);
                    } else {
                      setPortionSizeError('Must be greater than 0');
                    }
                  }
                }}
              />
              {selectedShape === 'rectangle' && selectedPortionSize === 'size' && (
                <TextInput
                  style={[styles.filedBox, styles.fildText]}
                  placeholder="e.g. 15 (width)"
                  keyboardType="numeric"
                  value={portionSize2}
                  onChangeText={(text) => {
                    // Remove non-digits
                    const digits = text.replace(/[^0-9]/g, '');
                    
                    if (digits === '') {
                      setPortionSize2('');
                      setPortionSize2Error(null);
                    } else {
                      const num = parseInt(digits, 10);
                      
                      // Validate: must be integer > 0
                      if (num > 0) {
                        setPortionSize2(String(num));
                        setPortionSize2Error(null);
                      } else {
                        setPortionSize2Error('Must be greater than 0');
                      }
                    }
                  }}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.stepBox}>
          <Text style={styles.stepsText}>Allergenes in the recipe</Text>
          {(() => {
            const allergenPairs = [];
            for (let i = 0; i < allergensList.length; i += 2) {
              allergenPairs.push(allergensList.slice(i, i + 2));
            }
            return allergenPairs.map((pair, index) => (
              <View key={index} style={styles.allergenRow}>
                {pair.map((allergen) => {
                  const isSelected = selectedAllergens.includes(allergen);
                  return (
                    <Pressable style={styles.allergenOption}
                      key={allergen}
                      onPress={() => toggleAllergen(allergen)}
                    >
                      <View style={styles.allergenContent}>
                        <View style={styles.tickBox}>
                          {isSelected && <Text style={styles.tickMark}>✓</Text>}
                        </View>
                        <Text style={styles.allergenOptionText}>{allergen}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ));
          })()}
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
          <View key={idx} style={{ marginBottom: 20 }}>
            <View style={styles.ingredientHeader}>
              <Text style={styles.ingedientText}>Ingredient {idx + 1}</Text>
              {ingredients.length > 1 ? (
                <Pressable style={styles.removeButton} onPress={() => removeIngredientRow(idx)}>
                  <Text style={styles.removeButtonText}>X</Text>
                </Pressable>
              ) : null}
            </View>
            <SelectList
              data={allIngredients.map((ing) => ({
                key: ing.name,
                value: ing.name,
              }))}
              setSelected={(value: string) => updateIngredient(idx, { name: value })}
              placeholder="Select ingredient..."
              boxStyles={styles.filedBox}
              inputStyles={styles.fildText}
              searchPlaceholder="Search ingredient..."
            />

            <TouchableOpacity
                onPress={() => {
                    alert('Make sure there is not already an ingredient with the same name. If there is, just select it from the dropdown.');
                addNewIngredient(idx)
                }}>
                <View pointerEvents="none" style={styles.AddButton}>
                    <TextInput
                        onChange={() => {}}
                        value={ing.name}
                onChangeText={(t) => updateIngredient(idx, { name: t })}
                placeholder="New ingredient"
                style={styles.AddButtonText} 
                    />
                </View>
            </TouchableOpacity>
            <TextInput
              value={ing.amount}
              onChangeText={(t) => updateIngredient(idx, { amount: t })}
              placeholder="Amount"
              keyboardType="decimal-pad"
              style={styles.fildBox}
            />
            <TextInput
              value={ing.unit}
              onChangeText={(t) => updateIngredient(idx, { unit: t })}
              placeholder="Unit (g, ml, piece, etc)"
              style={styles.fildBox}
            />
          </View>
        ))}
        <View>
          <Pressable style={styles.AddButton} onPress={addIngredientRow}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" style={styles.addIcon}>
            <path d="M3.33252 7.99805H12.6636" stroke="white" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7.99805 3.33252V12.6636" stroke="white" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <Text style={styles.AddButtonText}>Add ingredient row</Text>
          </Pressable>
        </View>
        </View>

        <Pressable  style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed,]} 
        disabled={!canSave || saving} onPress={saveRecipe}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save recipe'}</Text>
        </Pressable>
      </ScrollView>
      <Footer />
      </View>
      </LinearGradient>
      
  );
}

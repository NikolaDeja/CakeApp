import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { calculateArea } from '../../lib/scalingUtils';
import { styles } from './AddRecipeScreen.styles';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { LinearGradient } from 'expo-linear-gradient';
import { SelectList } from 'react-native-dropdown-select-list';

type IngredientInput = {
  name: string;
  amount: string;
  unit: string;
  isCustom?: boolean;
  selectedAllergens?: string[];
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
  const [numberOfLayersItCovers, setNumberOfLayersItCovers] = useState('');
  const [numberOfLayersItCoversError, setNumberOfLayersItCoversError] = useState<string | null>(null);
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
    if (!selectedPortionSize) return false;
    if (!selectedShape) return false;

    const sizeValue = Number(String(portionSize).replace(',', '.'));
    if (!Number.isFinite(sizeValue) || sizeValue <= 0) return false;
    if (selectedPortionSize === 'size' && selectedShape === 'rectangle') {
      const sizeValue2 = Number(String(portionSize2).replace(',', '.'));
      if (!Number.isFinite(sizeValue2) || sizeValue2 <= 0) return false;
    }

    const hasValidIngredient = ingredients.some((i) => {
      const name = i.name.trim();
      const amount = Number(String(i.amount).replace(',', '.'));
      const unit = i.unit.trim();
      return name.length > 0 && Number.isFinite(amount) && amount > 0 && unit.length > 0;
    });

    return hasValidIngredient;
  }, [recipeName, recipeTypeId, selectedPortionSize, portionSize, portionSize2, selectedShape, ingredients]);

  const updateIngredient = (index: number, patch: Partial<IngredientInput>) => {
    setIngredients((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const addIngredientRow = () => {
    setIngredients((prev) => [...prev, { name: '', amount: '', unit: 'g' }]);
  };

  const handleIngredientNotOnList = (idx: number) => {
    updateIngredient(idx, { isCustom: true, name: '', selectedAllergens: [] });
  };

  const addNewIngredient = (idx: number) => {
    const ingredientName = ingredients[idx].name.trim();
    
    if (!ingredientName) {
      Alert.alert('Error', 'Please enter an ingredient name');
      return;
    }

    const exists = allIngredients.some((ing) => ing.name.toLowerCase() === ingredientName.toLowerCase());
    
    if (exists) {
      Alert.alert('Already Exists', `"${ingredientName}" is already in the ingredients list.`);
      return;
    }

    Alert.alert('Success', `"${ingredientName}" will be added as a new ingredient.`);
  };

  const removeIngredientRow = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const saveRecipe = async () => {
    if (!canSave || saving) return;

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Not signed in', 'Please sign in again to save your recipe.');
        return;
      }

      const validIngredients = ingredients
        .map((i) => ({
          originalIngredient: i,
          name: i.name.trim(),
          amount: Number(String(i.amount).replace(',', '.')),
          unit: i.unit.trim(),
        }))
        .filter((i) => i.name && Number.isFinite(i.amount) && i.amount > 0 && i.unit);

      if (validIngredients.length === 0) {
        Alert.alert('Missing ingredients', 'Add at least one valid ingredient.');
        return;
      }

      const recipePayload: any = {
        name: recipeName.trim(),
        recipe_type_id: recipeTypeId,
        instructions: instructions.trim() || null,
        user_id: user.id,
      };

      if (numberOfLayersItCovers) {
        const layers = Number(String(numberOfLayersItCovers).replace(',', '.'));
        if (Number.isFinite(layers) && layers > 0) {
          recipePayload.default_layers_count = layers;
        }
      }

      const { data: recipeRow, error: recipeError } = await supabase
        .from('recipes')
        .insert([recipePayload])
        .select('id')
        .single();

      if (recipeError) throw recipeError;

      const newRecipeId = recipeRow.id as number;
      const dbShape = selectedShape;

      // Save recipe size reference
      let sizeRefPayload: any = {
        recipe_id: newRecipeId,
        shape: dbShape,
      };

      if (selectedPortionSize === 'size') {
        const dimension1 = Number(String(portionSize).replace(',', '.'));
        let dimension2 = null;
        let areaCm2 = 0;

        if (selectedShape === 'rectangle') {
          dimension2 = Number(String(portionSize2).replace(',', '.'));
          if (!Number.isFinite(dimension2) || dimension2 <= 0) {
            throw new Error('Width for rectangle size is required.');
          }
          areaCm2 = calculateArea(selectedShape, undefined, dimension1, dimension2);
          sizeRefPayload.length_cm = dimension1;
          sizeRefPayload.width_cm = dimension2;
        } else if (selectedShape === 'square') {
          areaCm2 = calculateArea(selectedShape, dimension1);
          sizeRefPayload.width_cm = dimension1;
          sizeRefPayload.length_cm = dimension1;
        } else if (selectedShape === 'circle' || selectedShape === 'heart') {
          areaCm2 = calculateArea(selectedShape, dimension1);
          sizeRefPayload.diameter_cm = dimension1;
        } else {
          throw new Error('Invalid shape selected for size calculation.');
        }

        sizeRefPayload.area_cm2 = Math.round(areaCm2);
      } else {
        const portionsCount = Number(String(portionSize).replace(',', '.'));
        if (!Number.isFinite(portionsCount) || portionsCount <= 0) {
          throw new Error('Portion count must be a positive number.');
        }

        const { data: guideRow, error: guideError } = await supabase
          .from('size_portion_guides')
          .select('diameter_cm, width_cm, length_cm, area_cm2')
          .eq('shape', dbShape)
          .eq('portions', portionsCount)
          .maybeSingle();

        if (guideError) throw guideError;
        if (!guideRow) {
          throw new Error('No matching size guide found for the selected shape and portions.');
        }

        sizeRefPayload = {
          ...sizeRefPayload,
          diameter_cm: guideRow.diameter_cm ?? null,
          width_cm: guideRow.width_cm ?? null,
          length_cm: guideRow.length_cm ?? null,
          area_cm2: guideRow.area_cm2 ?? null,
        };
      }

      const { error: sizeRefError } = await supabase.from('recipe_size_refs').insert([
        sizeRefPayload,
      ]);

      if (sizeRefError) {
        console.error('sizeRefError', sizeRefError, { sizeRefPayload, selectedShape, dbShape });
        throw sizeRefError;
      }

      // 2) Insert ingredients and join rows
      for (const ing of validIngredients) {
        const cleanName = ing.name;

        const { data: existing, error: findErr } = await supabase
          .from('ingredients')
          .select('id')
          .eq('name', cleanName)
          .maybeSingle();

        if (findErr) throw findErr;

        let ingredientId: number | undefined = existing?.id;

        if (!ingredientId) {
          const { data: created, error: createErr } = await supabase
            .from('ingredients')
            .insert([{ name: cleanName, default_unit: ing.unit }])
            .select('id')
            .single();

          if (createErr) throw createErr;
          ingredientId = created.id as number;

          // If this is a custom ingredient with allergens, add them to ingredient_allergens table
          const ingredientAllergens = ing.originalIngredient.selectedAllergens ?? [];
          if (ingredientAllergens.length > 0) {
            // Get allergen IDs from names
            const { data: allergenData, error: allergenFetchErr } = await supabase
              .from('allergens')
              .select('id, name')
              .in('name', ingredientAllergens);

            if (allergenFetchErr) throw allergenFetchErr;

            // Create ingredient_allergen associations
            const allergenAssociations = (allergenData ?? []).map((allergen: any) => ({
              ingredient_id: ingredientId,
              allergen_id: allergen.id,
            }));

            if (allergenAssociations.length > 0) {
              const { error: allergenLinkErr } = await supabase
                .from('ingredient_allergens')
                .insert(allergenAssociations);

              if (allergenLinkErr) throw allergenLinkErr;
            }
          }
        }

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

  const toggleIngredientAllergen = (idx: number, allergen: string) => {
    updateIngredient(idx, {
      selectedAllergens: (
        ingredients[idx].selectedAllergens ?? []
      ).includes(allergen)
        ? (ingredients[idx].selectedAllergens ?? []).filter((a) => a !== allergen)
        : [...(ingredients[idx].selectedAllergens ?? []), allergen],
    });
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
          <Text style={styles.stepsText}>Portions or size</Text>
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
          <Text style={styles.stepsText}>Number of layers this recipe covers</Text>
          <TextInput
            style={[styles.filedBox, styles.fildText]}
            placeholder="e.g. 1, 2, 3"
            keyboardType="numeric"
            value={numberOfLayersItCovers}
            onChangeText={(text) => {
              // Remove non-digits
              const digits = text.replace(/[^0-9]/g, '');
              
              if (digits === '') {
                setNumberOfLayersItCovers('');
                setNumberOfLayersItCoversError(null);
              } else {
                const num = parseInt(digits, 10);
                
                // Validate: must be integer > 0
                if (num > 0) {
                  setNumberOfLayersItCovers(String(num));
                  setNumberOfLayersItCoversError(null);
                } else {
                  setNumberOfLayersItCoversError('Must be greater than 0');
                }
              }
            }}
          />
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
              {ing.isCustom ? (
                <>
                  <TextInput
                    value={ing.name}
                    onChangeText={(t) => updateIngredient(idx, { name: t })}
                    placeholder="Type new ingredient name"
                    style={styles.fildBox}
                  />
                  <Text style={[styles.stepsText, { marginTop: 15, marginBottom: 10 }]}>Allergens in this ingredient</Text>
                  <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {allergensList.map((allergen) => (
                      <Pressable
                        key={allergen}
                        style={styles.allergenOption}
                        onPress={() => toggleIngredientAllergen(idx, allergen)}
                      >
                        <View style={styles.allergenContent}>
                          <View
                            style={[
                              styles.tickBox,
                              (ing.selectedAllergens ?? []).includes(allergen) && {
                                backgroundColor: '#FF9ECD',
                              },
                            ]}
                          >
                            {(ing.selectedAllergens ?? []).includes(allergen) && (
                              <Text style={styles.tickMark}>✓</Text>
                            )}
                          </View>
                          <Text style={styles.allergenOptionText}>{allergen}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                  <Pressable style={[styles.AddButton, { marginTop: 10 }]} onPress={() => updateIngredient(idx, { isCustom: false, name: '', selectedAllergens: [] })}>
                    <Text style={styles.AddButtonText}>Choose from list instead</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <SelectList
                    data={allIngredients.map((ing) => ({
                      key: ing.name,
                      value: ing.name,
                    }))}
                    setSelected={(value: string) => updateIngredient(idx, { name: value, isCustom: false })}
                    placeholder="Select ingredient..."
                    boxStyles={styles.filedBox}
                    inputStyles={styles.fildText}
                    searchPlaceholder="Search ingredient..."
                  />
                  <Pressable style={styles.AddButton} onPress={() => handleIngredientNotOnList(idx)}>
                    <Text style={styles.AddButtonText}>Ingredient not on the list</Text>
                  </Pressable>
                </>
              )}
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
        </View>
        <View>
          <Pressable style={styles.AddButton} onPress={addIngredientRow}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" style={styles.addIcon}>
            <path d="M3.33252 7.99805H12.6636" stroke="white" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7.99805 3.33252V12.6636" stroke="white" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <Text style={styles.AddButtonText}>Add ingredient</Text>
          </Pressable>
        </View>

        <Pressable  style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]} 
        disabled={!canSave || saving} onPress={saveRecipe}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save recipe'}</Text>
        </Pressable>
      </ScrollView>
      <Footer />
      </View>
      </LinearGradient>
      
  );
}

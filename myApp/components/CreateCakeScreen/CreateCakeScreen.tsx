import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list'; 
import { styles } from './CreateCakeScreen.styles';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, TextInput } from 'react-native-gesture-handler';

type SelectItem = { key: string; value: string };

export default function CreateCakeScreen({ navigation }: any) {

    const [caketype, setCaketype] = useState('');
  const [caketype2, setCaketype2] = useState('');
  const [showSecondCakeType, setShowSecondCakeType] = useState(false);
  const [layerCount, setLayerCount] = useState('1');
  const [layers, setLayers] = useState<string[]>(['', '', '', '', '', '']);
  const [layerTypes, setLayerTypes] = useState<string[]>(['', '', '', '', '', '']);
  const [portionSize, setPortionSize] = useState('');
  const [portionSize2, setPortionSize2] = useState('');
  const [portionSizeError, setPortionSizeError] = useState<string | null>(null);
  const [portionSize2Error, setPortionSize2Error] = useState<string | null>(null);
  const [allergensList, setAllergensList] = useState<string[]>([]);
  const [layerCountError, setLayerCountError] = useState<string | null>(null);



  const [cakeTypeOptions, setCakeTypeOptions] = useState<SelectItem[]>([]);
  const [creamOptions, setCreamOptions] = useState<SelectItem[]>([]);
  const [fillingOptions, setFillingOptions] = useState<SelectItem[]>([]);
  const [ganacheOptions, setGanacheOptions] = useState<SelectItem[]>([]);
  const [crunchOptions, setCrunchOptions] = useState<SelectItem[]>([]);
  const [outerCoatingOptions, setOuterCoatingOptions] = useState<SelectItem[]>([]);
  const [decorationsOptions, setDecorationsOptions] = useState<SelectItem[]>([]);
  const [selectedPortionSize, setSelectedPortionSize] = useState<'portions' | 'size' | ''>('');
  const [selectedShape, setSelectedShape] = useState<'circle' | 'square' | 'rectangle' | 'heart' | ''>('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedDecorations, setSelectedDecorations] = useState<string[]>([]);
  const [outerLayer, setOuterLayer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const layerCountNumber = layerCount
    ? Math.min(6, Math.max(1, Number(layerCount)))
    : 0;

  const canCreate =
    !!caketype &&
    layerCountNumber > 0 &&
    layers.slice(0, layerCountNumber).every((value) => !!value) &&
    selectedPortionSize &&
    !!portionSize &&
    !portionSizeError &&
    !layerCountError &&
    !!layerCount &&
    (selectedShape !== 'rectangle' || (!!portionSize2 && !portionSize2Error));

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((item) => item !== allergen)
        : [...prev, allergen]
    );
  };

  const toggleDecoration = (decoration: string) => {
    setSelectedDecorations((prev) =>
      prev.includes(decoration)
        ? prev.filter((item) => item !== decoration)
        : [...prev, decoration]
    );
  };


  const getFlavorOptionsByType = (layerType: string, isFirstLayer: boolean): SelectItem[] => {
    let options: SelectItem[] = [];
    
    switch(layerType) {
      case 'Cream':
        options = creamOptions;
        break;
      case 'Filling':
        options = fillingOptions;
        break;
      case 'Ganash':
        options = ganacheOptions;
        break;
      case 'Crunch':
        options = crunchOptions;
        break;
      default:
        options = [];
    }
    
    return isFirstLayer ? options : [{ key: 'None', value: 'Dont want this layer' }, ...options];
  };


  // Store all recipes with their ingredients and allergens
  const [allRecipes, setAllRecipes] = useState<any[]>([]);

  // Fetch recipes with their ingredients and allergens
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all recipes with their types, ingredients, and allergens
        const recipesRes = await supabase
          .from('recipes')
          .select(`
            id, name, recipe_types!fk_recipes_recipe_type(code),
            recipe_ingredients(
              ingredient_id,
              ingredients(
                name,
                ingredient_allergens(
                  allergens(name)
                )
              )
            )
          `)
          .order('name', { ascending: true });

        if (recipesRes.error) throw recipesRes.error;

        setAllRecipes(recipesRes.data ?? []);

        // Decorations (no filtering needed)
        const decorations = (recipesRes.data ?? []).filter((r: any) => r.recipe_types?.code === 'decoration').map((r: any) => r.name);
        setDecorationsOptions(decorations.map((name: string) => ({ key: name, value: name })));

        // Fetch allergens
        const allergensRes = await supabase
          .from('allergens')
          .select('name')
          .order('name', { ascending: true });
        if (allergensRes.error) throw allergensRes.error;
        setAllergensList((allergensRes.data ?? []).map((a: any) => a.name));
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Helper to check if a recipe contains any selected allergens
  const recipeHasAllergen = (recipe: any, selectedAllergens: string[]) => {
    if (!selectedAllergens.length) return false;
    for (const ri of recipe.recipe_ingredients ?? []) {
      const ingredient = ri.ingredients;
      if (!ingredient) continue;
      for (const ia of ingredient.ingredient_allergens ?? []) {
        if (ia.allergens && selectedAllergens.includes(ia.allergens.name)) {
          return true;
        }
      }
    }
    return false;
  };

  // Filter and set options whenever allergens or recipes change
  useEffect(() => {
    const filterAndSetOptions = () => {
      const filterRecipes = (typeCode: string) =>
        allRecipes.filter((r: any) => r.recipe_types?.code === typeCode && !recipeHasAllergen(r, selectedAllergens));

      setCakeTypeOptions(filterRecipes('cake_base').map((r: any) => ({ key: r.name, value: r.name })));
      setCreamOptions(filterRecipes('cream').map((r: any) => ({ key: r.name, value: r.name })));
      setFillingOptions(filterRecipes('filling').map((r: any) => ({ key: r.name, value: r.name })));
      setGanacheOptions(filterRecipes('ganache').map((r: any) => ({ key: r.name, value: r.name })));
      setCrunchOptions(filterRecipes('crunch').map((r: any) => ({ key: r.name, value: r.name })));
      setOuterCoatingOptions(filterRecipes('outer_coating').map((r: any) => ({ key: r.name, value: r.name })));
    };
    filterAndSetOptions();
  }, [allRecipes, selectedAllergens]);

    return (
      <LinearGradient
                //colors={[ '#FFE8DE', '#FFF7F3', '#F2D7E3']}
                //colors={[ '#FEF5EF', '#F8F8F8', '#FFE7F1']}
                //colors={[ '#FFF4ED', '#FEF5EF', '#FEF6F1', '#FDF7F3', '#FCF7F4', '#FBF8F6', '#FBF9F8', '#FAFAFA', '#FBF7F9', '#FCF4F7', '#FCF1F6', '#FDEDF4', '#FEEAF3', '#FEE7F1', '#FFE4F0' ]}
                colors={[ '#FFF4ED', '#FEF5EF', '#FEF6F1', '#FDF7F3', '#FCF7F4', '#FBF8F6', '#FBF9F8', '#FAFAFA', '#FBF7F9', '#FCF4F7', '#FCF1F6', '#FDEDF4', '#FEEAF3', '#FEE7F1', '#FFE4F0' ]}
                start={{ x: 0, y: 0 }}   // top-left
                end={{ x: 1, y: 1 }}     // bottom-right
                style={{ flex: 1 ,backgroundColor: '#FFF',
                shadowOpacity: 0.05}}>
        <View style={{ flex: 1 }}>
          <ScrollView style={{backgroundColor: 'transparent'}} contentContainerStyle={{ paddingBottom: 10 }}>
            <View>
              <Header />
              <Text style={styles.topText}>Here you can create</Text>
              <Text style={styles.topText}>your custom cake!</Text>
              
              
              <View style={styles.stepBox}>
                <Text style={styles.stepsText}>Step 1: Shape</Text>
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
                <Text style={styles.stepsText}>Step 3: Allergenes to avoid</Text>
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

                  {/* Debug: see selected values */}
                  <Text>Selected: {selectedAllergens.join(', ')}</Text>
              </View>
  
              
              <View style={styles.stepBox}>
                <Text style={styles.stepsText}>Step 4: Number of layers</Text>
                <TextInput
                    style={[styles.filedBox, styles.fildText]}
                    value={layerCount}
                    onChangeText={(text) => {
                      // Only allow digits
                      const digits = text.replace(/[^0-9]/g, '');
                      
                      if (digits === '') {
                        setLayerCount('');
                        setLayerCountError(null);
                        return;
                      }
                      
                      const num = Number(digits);
                      
                      // Validate: must be between 1 and 6
                      if (num < 1) {
                        setLayerCountError('Minimum 1 layer required');
                        setLayerCount('');
                      } else if (num > 6) {
                        setLayerCountError('Maximum 6 layers allowed');
                        // Set to 6 if they try to enter more
                        setLayerCount('6');
                      } else {
                        setLayerCount(String(num));
                        setLayerCountError(null);
                      }
                    }}
                    placeholder="Enter 1 to 6"
                    keyboardType="numeric"
                    maxLength={1}
                />
                {layerCountError && (
                  <Text style={{ color: 'red', marginTop: 8, fontSize: 12 }}>
                    ⚠ {layerCountError}
                  </Text>
                )}
                {layerCount && !layerCountError && (
                  <Text style={{ color: 'green', marginTop: 8, fontSize: 12 }}>
                    ✓ {layerCount} layers selected
                  </Text>
                )}
              </View>

              <View style={styles.stepBox}>
                <Text style={styles.stepsText}>Step 5: Cake type</Text>
                <SelectList
                    boxStyles={styles.filedBox}
                    inputStyles={styles.fildText}
                    setSelected={setCaketype}
                    data={cakeTypeOptions}
                    placeholder="Select First Cake Type"
                />
                
                {caketype && !showSecondCakeType && (
                  <Pressable 
                    style={styles.secondCakeButton}
                    onPress={() => setShowSecondCakeType(true)}
                  >
                    <Text style={styles.optionsButtonsText}>+ Add Second Cake Type</Text>
                  </Pressable>
                )}
                
                {showSecondCakeType && (
                  <>
                    <SelectList
                        boxStyles={styles.filedBox}
                        inputStyles={styles.fildText}
                        setSelected={setCaketype2}
                        data={cakeTypeOptions}
                        placeholder="Select Second Cake Type"
                    />
                    {caketype2 && (
                      <Pressable 
                        style={styles.secondCakeButton}
                        onPress={() => {
                          setCaketype2('');
                          setShowSecondCakeType(false);
                        }}
                      >
                        <Text style={styles.optionsButtonsText}>✕ Remove Second Type</Text>
                      </Pressable>
                    )}
                  </>
                )}
              </View>

              <View style={styles.stepBox}>
                <Text style={styles.stepsText}>Step 6: Flavours of layers</Text>
                {Array.from({ length: layerCountNumber || 1 }, (_, idx) => {
                  const ordinal = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'][idx];
                  const layerTypeOptions = ['Cream', 'Filling', 'Ganash', 'Crunch'];
                  return (
                    <View key={idx}>
                      <Text style={[styles.stepsText, { marginTop: 20, color: '#333', fontWeight: 'bold' }]}>{ordinal} Layer</Text>
                      <Text style={[styles.stepsText, { marginTop: 8, marginBottom: 8 }]}>Select Layer Type</Text>
                      <View style={styles.buttonsContainer}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.optionsButtons,
                            (pressed || layerTypes[idx] === 'Cream') && styles.optionsButtonsHover,
                          ]}
                          onPress={() => {
                            const newLayerTypes = [...layerTypes];
                            newLayerTypes[idx] = 'Cream';
                            setLayerTypes(newLayerTypes);
                          }}
                        >
                          <Text style={styles.optionsButtonsText}>Cream</Text>
                        </Pressable>
                        <Pressable
                          style={({ pressed }) => [
                            styles.optionsButtons,
                            (pressed || layerTypes[idx] === 'Filling') && styles.optionsButtonsHover,
                          ]}
                          onPress={() => {
                            const newLayerTypes = [...layerTypes];
                            newLayerTypes[idx] = 'Filling';
                            setLayerTypes(newLayerTypes);
                          }}
                        >
                          <Text style={styles.optionsButtonsText}>Filling</Text>
                        </Pressable>
                      </View>
                      <View style={styles.buttonsContainer}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.optionsButtons,
                            (pressed || layerTypes[idx] === 'Ganash') && styles.optionsButtonsHover,
                          ]}
                          onPress={() => {
                            const newLayerTypes = [...layerTypes];
                            newLayerTypes[idx] = 'Ganash';
                            setLayerTypes(newLayerTypes);
                          }}
                        >
                          <Text style={styles.optionsButtonsText}>Ganash</Text>
                        </Pressable>
                        <Pressable
                          style={({ pressed }) => [
                            styles.optionsButtons,
                            (pressed || layerTypes[idx] === 'Crunch') && styles.optionsButtonsHover,
                          ]}
                          onPress={() => {
                            const newLayerTypes = [...layerTypes];
                            newLayerTypes[idx] = 'Crunch';
                            setLayerTypes(newLayerTypes);
                          }}
                        >
                          <Text style={styles.optionsButtonsText}>Crunch</Text>
                        </Pressable>
                      </View>
                      {layerTypes[idx] && (
                        <SelectList
                          key={`flavor-${idx}`}
                          setSelected={(value: string) => {
                            setLayers((prev) => {
                              const next = [...prev];
                              next[idx] = value;
                              return next;
                            });
                          }}
                          data={getFlavorOptionsByType(layerTypes[idx], idx === 0)}
                          placeholder={`Select Flavour for ${ordinal} ${layerTypes[idx]} layer`}
                          boxStyles={styles.filedBox}
                          inputStyles={styles.fildText}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
              <View style={styles.stepBox}>
                <Text style={styles.stepsText}>Step 7: The outer layer</Text>
                <SelectList
                    setSelected={setOuterLayer}
                    placeholder="Select Flavour for Outer layer"
                    boxStyles={styles.filedBox}
                    inputStyles={styles.fildText}
                    data={outerCoatingOptions}
                />
              </View>
              <View style={styles.stepBox}>
                <Text style={styles.stepsText}>Step 8: Decorations</Text>
                {(() => {
                  const decorationsPairs = [];
                    for (let i = 0; i < decorationsOptions.length; i += 2) {
                    decorationsPairs.push(decorationsOptions.slice(i, i + 2).map(item => item.value));
                    }
                  return decorationsPairs.map((pair, index) => (
                    <View key={index} style={styles.allergenRow}>
                      {pair.map((decoration) => {
                        const isSelected = selectedDecorations.includes(decoration);
                        return (
                          <Pressable style={styles.allergenOption}
                            key={decoration}
                            onPress={() => toggleDecoration(decoration)}
                          >
                            <View style={styles.allergenContent}>
                              <View style={styles.tickBox}>
                                {isSelected && <Text style={styles.tickMark}>✓</Text>}
                              </View>
                              <Text style={styles.allergenOptionText}>{decoration}</Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  ));
                })()}

                  {/* Debug: see selected values */}
                  <Text>Selected: {selectedDecorations.join(', ')}</Text>
              </View>
  
                  
              <Pressable style={styles.getRecipeButton} onPress={() =>
                  navigation.navigate("Recipe", {
                      selectedPortionSize: selectedPortionSize,
                      portionSize: portionSize,
                      portionSize2: portionSize2,
                      selectedShape: selectedShape,
                      selectedAllergens: selectedAllergens,
                      layerCount: layerCountNumber,
                      caketype: caketype,
                      caketype2: caketype2,
                      layers: layers.slice(0, layerCountNumber),
                      selectedDecorations: selectedDecorations,
                      outerLayer: outerLayer,
                  })}>
                  <Text style={styles.getRecipeButtonText}>Get Your Recipe</Text>
              </Pressable>
          </View>

        </ScrollView>
        <Footer />
      </View>
      </LinearGradient>
     );
};

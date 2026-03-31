import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list'; 
import { styles } from './CreateCakeScreen.styles';
import Header from '../Header.tsx/Header';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, TextInput } from 'react-native-gesture-handler';

type SelectItem = { key: string; value: string };

export default function CreateCakeScreen({ navigation }: any) {

    const [caketype, setCaketype] = useState('');
  const [layerCount, setLayerCount] = useState('1');
  const [layers, setLayers] = useState<string[]>(['', '', '', '', '', '']);

  const allergens = [
  'Gluten',
  'Dairy',
  'Eggs',
  'Nuts',
  'Soy',
  'Peanuts',
];

 const decorations = [
  'Sprinkles',
  'Chocolate Chips',
  'Fruit Slices',
  'Edible Flowers',
  'Candy',
  'Fondant Shapes',
];

  const [cakeTypeOptions, setCakeTypeOptions] = useState<SelectItem[]>([]);
  const [creamOptions, setCreamOptions] = useState<SelectItem[]>([]);
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
    layers.slice(0, layerCountNumber).every((value) => !!value);

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


  const creamOptionsWithNone = useMemo(() => {
    return [{ key: 'None', value: 'Dont want this layer' }, ...creamOptions];
  }, [creamOptions]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch cake types
        const cakeRes = await supabase
          .from('recipe')
          .select('name')
          .eq('type', 'cake')
          .order('name', { ascending: true });

        if (cakeRes.error) throw cakeRes.error;

        // Fetch creams
        const creamRes = await supabase
          .from('recipe')
          .select('name')
          .eq('type', 'cream')
          .order('name', { ascending: true });

        if (creamRes.error) throw creamRes.error;

        const cakeItems: SelectItem[] = (cakeRes.data ?? []).map((r: any) => ({
          key: r.name,
          value: r.name,
        }));

        const creamItems: SelectItem[] = (creamRes.data ?? []).map((r: any) => ({
          key: r.name,
          value: r.name,
        }));

        setCakeTypeOptions(cakeItems);
        setCreamOptions(creamItems);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

    return (
      <LinearGradient
                //colors={[ '#FFE8DE', '#FFF7F3', '#F2D7E3']}
                //colors={[ '#FEF5EF', '#F8F8F8', '#FFE7F1']}
                colors={[ '#FFF4ED', '#FEF5EF', '#FEF6F1', '#FDF7F3', '#FCF7F4', '#FBF8F6', '#FBF9F8', '#FAFAFA', '#FBF7F9', '#FCF4F7', '#FCF1F6', '#FDEDF4', '#FEEAF3', '#FEE7F1', '#FFE4F0' ]}
                start={{ x: 0, y: 0 }}   // top-left
                end={{ x: 1, y: 1 }}     // bottom-right
                style={{ flex: 1 ,backgroundColor: '#FFF',
                shadowOpacity: 0.05}}>
        
        <ScrollView style={{backgroundColor: 'transparent'}}>
          <View>
              <Header />
              <Text style={styles.topText}>Here you can create</Text>
              <Text style={styles.topText}>your custom cake!</Text>
              <View style={styles.stepBox}>
                <Text style={styles.stepsText}>Step 1: Portions or size</Text>
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
                    style={[styles.filedBox, styles.fildText]}
                    placeholder="16"
                    keyboardType="numeric"
                />
              </View>
              <View style={styles.stepBox}>
                <Text style={styles.stepsText}>Step 2: Shape</Text>
                <View style={styles.buttonsContainer}>
                  <Pressable style={({pressed}) =>[
                    styles.optionsButtons, 
                    (pressed || selectedShape === 'circle') && styles.optionsButtonsHover]}
                    onPress={() => setSelectedShape('circle')}
                  >
                    <Text style={styles.optionsButtonsText}>Circle</Text>
                  </Pressable>
                  <Pressable 
                  style={({pressed}) =>[
                    styles.optionsButtons, 
                    (pressed || selectedShape === 'square') && styles.optionsButtonsHover]} 
                    onPress={() => setSelectedShape('square')}
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
                    onPress={() => setSelectedShape('heart')}
                  >
                    <Text style={styles.optionsButtonsText}>Heart</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.stepBox}>
                <Text style={styles.stepsText}>Step 3: Allergenes to avoid</Text>
                {(() => {
                  const allergenPairs = [];
                  for (let i = 0; i < allergens.length; i += 2) {
                    allergenPairs.push(allergens.slice(i, i + 2));
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
                      const digits = text.replace(/[^0-9]/g, '');
                      if (!digits) {
                        setLayerCount('');
                        return;
                      }
                      const parsed = Math.min(6, Math.max(1, Number(digits)));
                      setLayerCount(String(parsed));
                    }}
                    placeholder="Put in the number of layers (1-6)"
                    keyboardType="numeric"
                />
              </View>

              <View style={styles.stepBox}>
                <Text style={styles.stepsText}>Step 5: Cake type</Text>
                <SelectList
                    boxStyles={styles.filedBox}
                    inputStyles={styles.fildText}
                    setSelected={setCaketype}
                    data={cakeTypeOptions}
                    placeholder="Select Type of Cake"
                />
              </View>

              <View style={styles.stepBox}>
                <Text style={styles.stepsText}>Step 6: Flavours of layers</Text>
                {Array.from({ length: layerCountNumber || 1 }, (_, idx) => {
                  const ordinal = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'][idx];
                  return (
                    <SelectList
                      key={idx}
                      setSelected={(value: string) => {
                        setLayers((prev) => {
                          const next = [...prev];
                          next[idx] = value;
                          return next;
                        });
                      }}
                      data={idx === 0 ? creamOptions : creamOptionsWithNone}
                      placeholder={`Select Flavour for ${ordinal} layer`}
                      boxStyles={styles.filedBox}
                      inputStyles={styles.fildText}
                    />
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
                    data={[
                      { key: 'fondant', value: 'fondant' },
                      { key: 'icing', value: 'icing' },
                    ]}
                />
              </View>
              <View style={styles.stepBox}>
                <Text style={styles.stepsText}>Step 8: Decorations</Text>
                {(() => {
                  const decorationsPairs = [];
                  for (let i = 0; i < decorations.length; i += 2) {
                    decorationsPairs.push(decorations.slice(i, i + 2));
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
                  <Text>Selected: {selectedAllergens.join(', ')}</Text>
             </View>
                  
              <Pressable style={styles.getRecipeButton} onPress={() =>
                  navigation.navigate("Recipe", {
                      caketype: caketype,
                      layer1: layers[0],
                      layer2: layers[1],
                      layer3: layers[2],
                      layerCount: layerCountNumber,
                      layers: layers.slice(0, layerCountNumber),
                      outerLayer: outerLayer,
                  })}>
                  <Text style={styles.getRecipeButtonText}>Get Your Recipe</Text>
              </Pressable>
          </View>

        </ScrollView>
      </LinearGradient>
     );
};

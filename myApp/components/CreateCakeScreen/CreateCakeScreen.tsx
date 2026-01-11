import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list'; 
import { styles } from './CreateCakeScreen.styles';
import Header from '../Header.tsx/Header';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native-gesture-handler';

type SelectItem = { key: string; value: string };

export default function CreateCakeScreen({ navigation }: any) {

    const [caketype, setCaketype] = useState('');
  const [layer1, setLayer1] = useState('');
  const [layer2, setLayer2] = useState('');
  const [layer3, setLayer3] = useState('');

  const [cakeTypeOptions, setCakeTypeOptions] = useState<SelectItem[]>([]);
  const [creamOptions, setCreamOptions] = useState<SelectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const canCreate =
    caketype &&
    layer1 &&
    (layer2 === '' || layer2) &&
    (layer3 === '' || layer3);


    return (
      <LinearGradient
                colors={[ '#FFE8DE', '#FFF7F3', '#F2D7E3']}
                start={{ x: 0, y: 0 }}   // top-left
                end={{ x: 1, y: 1 }}     // bottom-right
                style={{ flex: 1 ,backgroundColor: '#FFF',
                shadowOpacity: 0.05}}>
        
        <ScrollView style={{backgroundColor: 'transparent'}}>
          <View>
              <Header />
              <Text style={styles.text}>Select type of cake you want and all the flavours for the layers</Text>
              <SelectList
                  boxStyles={styles.tables}
                  inputStyles={styles.tableText}
                  setSelected={setCaketype}
                  data={cakeTypeOptions}
                  placeholder="Select Type of Cake"
              />
              <SelectList
                  setSelected={setLayer1}
                  data={creamOptions}
                  placeholder="Select Flavour for First layer"

                  boxStyles={styles.tables}
                  inputStyles={styles.tableText}
              />
          
              <SelectList
                  setSelected={setLayer2}
                  data={creamOptionsWithNone}
                  placeholder="Select Flavour for Second layer"
                  boxStyles={styles.tables}
                  inputStyles={styles.tableText}
              />
              <SelectList
                  setSelected={setLayer3}
                  data={creamOptionsWithNone}
                  placeholder="Select Flavour for Third layer"

                  boxStyles={styles.tables}
                  inputStyles={styles.tableText}
              />
              <Pressable style={styles.getRecipeButton} onPress={() =>
                  navigation.navigate("Recipe", {
                      caketype: caketype,
                      layer1: layer1,
                      layer2: layer2,
                      layer3: layer3,
                  })}>
                  <Text style={styles.getRecipeButtonText}>Get Your Recipe</Text>
              </Pressable>
          </View>

        </ScrollView>
      </LinearGradient>
    );
};

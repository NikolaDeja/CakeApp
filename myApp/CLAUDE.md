# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start            # expo start (Metro, pick platform from UI)
npm run android      # expo start --android
npm run ios          # expo start --ios
npm run web          # expo start --web
```

No test runner, linter, or formatter is configured. TypeScript is strict (`tsconfig.json` extends `expo/tsconfig.base` with `"strict": true`) — rely on `tsc` via the editor/Expo for type checking.

## Environment

Supabase credentials are read at build time from a local `.env` file:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

They are consumed in [lib/supabase.ts](lib/supabase.ts) with non-null assertions, so a missing `.env` will silently produce a broken client rather than a clear error. When adding new env vars that must reach the client bundle, they must be prefixed `EXPO_PUBLIC_`.

## Architecture

**Stack:** Expo SDK 54, React Native 0.81, React 19, TypeScript strict. New Architecture is enabled (`app.json` → `newArchEnabled: true`).

**Entry point:** [index.ts](index.ts) → [App.tsx](App.tsx). Despite `expo-router` being listed in `app.json` plugins and installed in dependencies, **the app does not use expo-router** — it uses `@react-navigation/native-stack` directly from `App.tsx`. Adding new screens means registering them on the `Stack.Navigator` there.

**Screens (native stack, no header):**
- `Home` — [components/HomeScreen/HomeScreen.tsx](components/HomeScreen/HomeScreen.tsx)
- `CreateCake` — [components/CreateCakeScreen/CreateCakeScreen.tsx](components/CreateCakeScreen/CreateCakeScreen.tsx)
- `Recipe` — [components/RecipeScreen/RecepieScreen.tsx](components/RecipeScreen/RecepieScreen.tsx) (file is misspelled "Recepie", component/export is `RecipeScreen`; the import path must match the file name)
- `AddRecipe` — [components/AddRecipeScreen/AddRecipeScreen.tsx](components/AddRecipeScreen/AddRecipeScreen.tsx)

Shared chrome: [Header](components/Header/Header.tsx) and [Footer](components/Footer/Footer.tsx). Every screen wraps content in `LinearGradient` + a `ScrollView`, with `Header` and `Footer` pinned.

**Component folder convention:** one folder per component containing `ComponentName.tsx` and `ComponentName.styles.ts` (a plain module that exports a `StyleSheet.create(...)` object as `styles`). Keep styles in the sibling `.styles.ts` file, not inline, to match existing code.

## Data layer (Supabase)

All DB access goes through the single client in [lib/supabase.ts](lib/supabase.ts). There is no repository/service layer — screens call `supabase.from(...)` directly.

**Schema as used by `CreateCakeScreen` and `RecipeScreen` (the current/intended schema):**
- `recipes(id, name, portions, instructions, estimated_time, recipe_type_id)`
- `recipe_types(id, code)` — `code` values used by the UI: `cake_base`, `cream`, `filling`, `ganache`, `crunch`, `outer_coating`, `decoration`
- `recipe_ingredients(recipe_id, ingredient_id, amount, unit)`
- `ingredients(id, name)`
- `ingredient_allergens(ingredient_id, allergen_id)`
- `allergens(id, name)`
- FK alias `fk_recipes_recipe_type` is used in nested selects, e.g. `recipe_types!fk_recipes_recipe_type(code)`.

**Known inconsistencies (treat as bugs, not conventions):**
- [AddRecipeScreen.tsx](components/AddRecipeScreen/AddRecipeScreen.tsx) writes to an **older/different schema**: tables `recipe` (singular) and `recepie_ingredients` with column `recepie_id`, and it inserts a free-form `type` string instead of resolving a `recipe_type_id`. Saving from this screen does **not** produce rows that `CreateCakeScreen`/`RecipeScreen` can read. If you touch this screen, align it with the plural `recipes` / `recipe_ingredients` schema and the `recipe_types` lookup.
- The `RootStackParamList` entry for `Recipe` in [App.tsx](App.tsx) declares params `{ cake, layer1, layer2, layer3 }`, but `CreateCakeScreen` navigates with a different, richer param set (`caketype`, `caketype2`, `layers: string[]`, `selectedAllergens`, `selectedDecorations`, `outerLayer`, `selectedPortionSize`, `portionSize`, `selectedShape`, `layerCount`), and `RecipeScreen` reads yet a third shape (`caketype`, `layer1`, `layer2`, `layer3`). The types, the sender, and the receiver are three different contracts — fix all three together.
- [App.tsx](App.tsx) runs `supabase.from('recipe').select('*')` in a top-level `useEffect` as a leftover debug probe against the old `recipe` table; safe to remove.

**Allergen filtering pattern:** `CreateCakeScreen` loads `recipes` once with the full nested `recipe_ingredients → ingredients → ingredient_allergens → allergens` tree, then filters client-side via `recipeHasAllergen` whenever `selectedAllergens` changes. Keep that one-shot-then-filter approach rather than re-querying per allergen change.

## SVG usage caveat

Several components embed inline `<svg>` with HTML-style attributes (`stroke-width`, `stroke-linecap`) directly in JSX — see `Header`, `Footer`, `AddRecipeScreen`'s add-ingredient button. These render on `react-native-web` but are **not** valid React Native elements and will not render on iOS/Android. `react-native-svg` is installed; new icons should use its `<Svg>`/`<Path>` components (with camelCase props like `strokeWidth`) if they need to work on native.

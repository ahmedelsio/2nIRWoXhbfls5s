# Ironmate Core Libs — Expo React Native Integration Guide

This directory (`/src/libs`) is a **100% self-contained, offline-first data, mathematical engine, and TanStack Query layer** designed to be dropped directly into any Expo React Native or Web project.

---

## 1. Required NPM Packages

Run this in your Expo project root:

```bash
npx expo install @react-native-async-storage/async-storage @react-native-community/netinfo
npm install @supabase/supabase-js @tanstack/react-query zod
```

---

## 2. Environment Variables (.env)

Add these to your Expo project's `.env`:

```ini
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

*(The client also gracefully falls back to `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` if configured).*

---

## 3. Expo Root Setup (`app/_layout.tsx` or `App.tsx`)

Initialize the storage adapters and TanStack Query client once at your application root:

```tsx
import React, { useEffect } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { QueryClientProvider } from '@tanstack/react-query';

import {
  queryClient,
  configureTanStackOnlineManager,
  onAppStateChange,
  configureSupabaseAuthStorage,
  LocalStore,
} from './libs';

// 1. Hook up native network status to TanStack Query onlineManager
configureTanStackOnlineManager(NetInfo);

// 2. Hook up native AsyncStorage to Supabase Auth & LocalStore
configureSupabaseAuthStorage(AsyncStorage);
LocalStore.initPersistentDriver(AsyncStorage);

export default function RootLayout() {
  // 3. Keep TanStack Query in sync with native app focus (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        onAppStateChange(status);
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Your Expo Router Stack or Navigation Container */}
    </QueryClientProvider>
  );
}
```

---

## 4. Usage in Screens & Components

### A. High-Speed Gym Floor Set Logging (< 16ms optimistic UI)
```tsx
import { useActiveSession, useSessionSets, useLogSetMutation } from './libs';

function ActiveWorkoutScreen() {
  const { data: session } = useActiveSession('user-id');
  const { data: sets } = useSessionSets(session?.id ?? '');
  const { mutate: logSet } = useLogSetMutation(session?.id ?? '');

  const handleCompleteSet = (setNumber: number, weightKg: number, reps: number, rir: number) => {
    logSet({
      session_id: session!.id,
      user_id: 'user-id',
      exercise_id: 'exercise-uuid',
      set_number: setNumber,
      weight_kg: weightKg,
      reps: reps,
      rir: rir,
      is_completed: true,
    });
    // Triggers instant optimistic local update & rest timer, then syncs offline/online
  };
}
```

### B. Exercise Library & Relational Substitutes
```tsx
import { useExercises, useRelationalSubstitutes } from './libs';

function ExerciseDetailScreen({ exerciseId }: { exerciseId: string }) {
  // Queries dedicated has-many relational exercise_substitutes table
  const { data: substitutes } = useRelationalSubstitutes(exerciseId);

  return (
    <>
      {substitutes?.map((sub) => (
        <Text key={sub.id}>
          {sub.name} — {sub.reason} (Match: {Math.round(sub.stimulus_match_rating * 100)}%)
        </Text>
      ))}
    </>
  );
}
```

### C. Barbell Plate Calculator (Pure Mathematical Engine)
```tsx
import { calculateBarbellPlates } from './libs';

// Calculate plates per side for 102.5kg target on a 20kg bar
const platePlan = calculateBarbellPlates(102.5, 20);
// Returns:
// {
//   targetWeightKg: 102.5,
//   achievableWeightKg: 102.5,
//   remainderKg: 0,
//   platesPerSide: [
//     { weightKg: 25, countPerSide: 1, color: '#dc2626' },
//     { weightKg: 15, countPerSide: 1, color: '#ca8a04' },
//     { weightKg: 1.25, countPerSide: 1, color: '#71717a' }
//   ]
// }
```

### D. Evidence-Based 1RM & Double Progression
```tsx
import { OneRepMaxEngine, ProgressionEngine } from './libs';

// Estimate 1RM using Brzycki formula
const e1rm = OneRepMaxEngine.brzycki(100, 6); // 116.1 kg

// Evaluate double progression step
const advice = ProgressionEngine.evaluateDoubleProgression(
  100, // current load
  [6, 8], // target rep range
  [
    { weightKg: 100, reps: 8, targetReps: 8, rir: 2 },
    { weightKg: 100, reps: 8, targetReps: 8, rir: 2 },
    { weightKg: 100, reps: 8, targetReps: 8, rir: 2 }
  ]
);
// Returns: { action: 'increase_weight', suggestedWeightKg: 102.5, reason: 'All sets hit 8 reps with clean reserve...' }
```

---

## 5. Folder Architecture Map

```
libs/
├── index.ts                     # Single umbrella export
├── README.md                    # Integration documentation
├── engine/                      # Zero-UI pure mathematical logic
│   ├── brzycki.ts               # 1RM / e1RM calculation
│   ├── plateMath.ts             # Greedy barbell plate change-making
│   ├── progression.ts           # Double progression & stall detection
│   ├── volumeLandmarks.ts       # MEV / MAV / MRV volume thresholds
│   └── index.ts
├── supabase/                    # Data access layer
│   ├── types.ts                 # Self-contained database types
│   ├── client.ts                # Cross-platform Supabase singleton
│   ├── schemas.ts               # Strict Zod schemas for all I/O
│   ├── workout.repository.ts    # Sessions and sets queries
│   ├── exercise.repository.ts   # Exercises and relational substitutes
│   ├── profile.repository.ts    # User profiles and settings
│   └── index.ts
├── tanstack/                    # React Query state management
│   ├── queryClient.ts           # Offline-first QueryClient configuration
│   ├── keys.ts                  # Structured query key factory
│   ├── useWorkouts.ts           # Session & set hooks + optimistic mutations
│   ├── useExercises.ts          # Library & relational substitute hooks
│   ├── useProfile.ts            # Profile queries & updates
│   ├── nativeSync.ts            # React Native NetInfo & AppState listeners
│   └── index.ts
└── offline/                     # Gym floor resilience
    ├── types.ts                 # Offline mutation & sync interfaces
    ├── storage.ts               # < 16ms memory cache + async persistence
    ├── syncWorker.ts            # Idempotent background sync worker
    ├── useNetworkStatus.ts      # Real-time online/offline hook
    └── index.ts
```

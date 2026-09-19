import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  FolderTree, 
  Copy, 
  Check, 
  FileCode, 
  Smartphone, 
  Sparkles, 
  Layers, 
  ExternalLink 
} from 'lucide-react';

interface ExpoProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPO_FILES = [
  {
    path: 'app.json',
    lang: 'json',
    title: 'app.json (Expo SDK 57 Config)',
    code: `{
  "expo": {
    "name": "Ironmate",
    "slug": "ironmate",
    "version": "1.0.0",
    "orientation": "portrait",
    "newArchEnabled": true,
    "sdkVersion": "57.0.0",
    "scheme": "ironmate",
    "userInterfaceStyle": "dark",
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.ironmate.app",
      "infoPlist": {
        "UIBackgroundModes": ["audio"],
        "NSHealthShareUsageDescription": "Ironmate reads sleep & HRV to adapt workout volume."
      }
    },
    "android": {
      "package": "com.ironmate.app",
      "permissions": ["android.permission.VIBRATE", "android.permission.WAKE_LOCK"]
    },
    "plugins": [
      "expo-router",
      "expo-haptics",
      ["expo-sqlite", { "enableFTS": true }]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}`
  },
  {
    path: 'metro.config.js',
    lang: 'javascript',
    title: 'metro.config.js (NativeWind v4 + Metro)',
    code: `const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });`
  },
  {
    path: 'app/_layout.tsx',
    lang: 'typescript',
    title: 'app/_layout.tsx (Root Stack)',
    code: `import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#09090b' }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal/plates" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modal/cues" options={{ presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}`
  },
  {
    path: 'app/(tabs)/_layout.tsx',
    lang: 'typescript',
    title: 'app/(tabs)/_layout.tsx (Expo Router Tabs)',
    code: `import { Tabs } from 'expo-router';
import { Sun, Dumbbell, Moon, BookOpen, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#ccff00',
      tabBarStyle: { backgroundColor: '#09090b', borderTopColor: '#27272a' }
    }}>
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color }) => <Sun color={color} size={22} /> }} />
      <Tabs.Screen name="gym" options={{ title: 'Floor', tabBarIcon: ({ color }) => <Dumbbell color={color} size={22} /> }} />
      <Tabs.Screen name="debrief" options={{ title: 'Debrief', tabBarIcon: ({ color }) => <Moon color={color} size={22} /> }} />
      <Tabs.Screen name="library" options={{ title: 'Library', tabBarIcon: ({ color }) => <BookOpen color={color} size={22} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <User color={color} size={22} /> }} />
    </Tabs>
  );
}`
  },
  {
    path: 'app/(tabs)/gym.tsx',
    lang: 'typescript',
    title: 'app/(tabs)/gym.tsx (Gym Floor Mode)',
    code: `// Sweaty-Finger UX, Large Tap Targets, Rest Timer
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function GymFloorScreen() {
  const [weightKg, setWeightKg] = useState(82.5);
  const [reps, setReps] = useState(6);
  const [rir, setRir] = useState(2);

  const handleLogSet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Log to offline SQLite queue & start rest timer
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-950 p-4">
      {/* Exercise context & large steppers */}
    </SafeAreaView>
  );
}`
  }
];

export const ExpoProjectModal: React.FC<ExpoProjectModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(EXPO_FILES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex h-[88vh] w-full max-w-4xl flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-main)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)]">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[var(--text-primary)]">React Native • Expo SDK 57</h2>
                <span className="rounded bg-[var(--accent-subtle)] border border-[var(--accent-border)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--accent)]">
                  Expo Router v4 + NativeWind
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Complete mobile project tree with offline SQLite, typed routes & native haptics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body: Left file tree + Right code viewer */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* File Tree Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <FolderTree className="h-3.5 w-3.5" /> Project Files
            </div>
            <div className="space-y-1 font-mono text-xs">
              {EXPO_FILES.map((f) => (
                <button
                  key={f.path}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                    selectedFile.path === f.path
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <FileCode className="h-4 w-4 shrink-0" />
                  <span className="truncate">{f.path}</span>
                </button>
              ))}
            </div>

            {/* Terminal Commands Card */}
            <div className="mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--accent)] mb-2">
                <Terminal className="h-3.5 w-3.5" /> Run on Device
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mb-2">
                To launch this app natively on your iPhone or Android with Expo Go:
              </p>
              <div className="bg-black rounded-lg p-2 font-mono text-[11px] text-neutral-300">
                <div className="text-[var(--accent)]">$ npx expo start</div>
                <div className="text-neutral-400 mt-1"># Scan QR with Expo Go</div>
              </div>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex flex-1 flex-col overflow-hidden bg-neutral-950">
            {/* Tab top */}
            <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/90 px-4 py-2 text-xs">
              <span className="font-mono font-bold text-neutral-300">{selectedFile.title}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Code Pre */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-neutral-200 leading-relaxed selection:bg-[var(--accent)] selection:text-[var(--accent-contrast)]">
              <pre>
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-main)] px-6 py-3 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span>Expo SDK: <strong>57.0.0</strong></span>
            <span>•</span>
            <span>React Native: <strong>0.79+</strong></span>
            <span>•</span>
            <span>Engine: <strong>New Architecture</strong></span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-[var(--accent)] px-4 py-1.5 text-xs font-bold text-[var(--accent-contrast)] hover:opacity-90"
          >
            Back to App Simulator
          </button>
        </div>
      </div>
    </div>
  );
};

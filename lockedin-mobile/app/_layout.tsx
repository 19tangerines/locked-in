import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="challenges/new" />
        <Stack.Screen name="challenges/create" />
        <Stack.Screen name="challenges/join" />
        <Stack.Screen name="challenges/[id]/index" />
        <Stack.Screen name="challenges/[id]/settings" />
        <Stack.Screen name="challenges/[id]/activity/new" />
        <Stack.Screen name="challenges/[id]/activity/[activityId]" />
        <Stack.Screen name="challenges/[id]/standings" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

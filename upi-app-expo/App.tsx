import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { Navigation } from './src/navigation';
import { COLORS } from './src/constants';

export default function App() {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <Navigation />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

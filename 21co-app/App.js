import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { configureStore } from '@reduxjs/toolkit';

// Ekranları içe aktaralım
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Redux store'u oluşturalım
const store = configureStore({
  reducer: {
    cart: (state = { items: [], total: 0 }, action) => {
      switch (action.type) {
        case 'ADD_TO_CART':
          const existingItem = state.items.find(item => item.id === action.payload.id);
          if (existingItem) {
            existingItem.quantity += 1;
            return {
              ...state,
              total: state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
            };
          }
          return {
            ...state,
            items: [...state.items, { ...action.payload, quantity: 1 }],
            total: state.items.reduce((total, item) => total + (item.price * item.quantity), 0) + action.payload.price
          };
        default:
          return state;
      }
    }
  }
});

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#27AE60',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Menu"
            component={MenuScreen}
            options={{ title: 'Kahve Menüsü' }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Profil' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
} 
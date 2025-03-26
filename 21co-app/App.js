import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { configureStore } from '@reduxjs/toolkit';
import { Ionicons } from '@expo/vector-icons';

// Ekranları içe aktaralım
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CartScreen from './src/screens/CartScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PaymentScreen from './src/screens/PaymentScreen';

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
        
        case 'REMOVE_FROM_CART':
          const filteredItems = state.items.filter(item => item.id !== action.payload.id);
          return {
            ...state,
            items: filteredItems,
            total: filteredItems.reduce((total, item) => total + (item.price * item.quantity), 0)
          };
        
        case 'UPDATE_QUANTITY':
          const updatedItems = state.items.map(item => {
            if (item.id === action.payload.id) {
              return { ...item, quantity: action.payload.quantity };
            }
            return item;
          });
          return {
            ...state,
            items: updatedItems,
            total: updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
          };
        
        case 'CLEAR_CART':
          return {
            items: [],
            total: 0
          };
          
        default:
          return state;
      }
    }
  }
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="ProfileTab"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'MenuTab') {
            iconName = focused ? 'cafe' : 'cafe-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2C3E50',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="MenuTab" component={MenuScreen} options={{ title: 'Sipariş Ver' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profil' }} />
      <Tab.Screen name="CartTab" component={CartScreen} options={{ title: 'Sepet' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2C3E50',
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
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Main"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{ 
              title: 'Ödeme',
              headerBackTitle: 'Geri',
              headerTintColor: '#FFFFFF'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

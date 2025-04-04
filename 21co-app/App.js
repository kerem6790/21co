import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { configureStore } from '@reduxjs/toolkit';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './src/firebase/firebaseConfig';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Ekranları içe aktaralım
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CartScreen from './src/screens/CartScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import AdminOrdersScreen from './src/screens/AdminOrdersScreen';

// Redux store'u oluşturalım
const store = configureStore({
  reducer: {
    cart: (state = { items: [], total: 0 }, action) => {
      switch (action.type) {
        case 'ADD_TO_CART':
          const existingItem = state.items.find(item => item.id === action.payload.id);
          if (existingItem) {
            // Yeni bir items array'i oluştur
            const updatedItems = state.items.map(item => {
              if (item.id === action.payload.id) {
                return { ...item, quantity: item.quantity + 1 };
              }
              return item;
            });
            
            return {
              ...state,
              items: updatedItems,
              total: updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
            };
          }
          
          // Yeni ürün ekle
          const newItem = { ...action.payload, quantity: 1 };
          const newItems = [...state.items, newItem];
          
          return {
            ...state,
            items: newItems,
            total: newItems.reduce((total, item) => total + (item.price * item.quantity), 0)
          };
        
        case 'ADD_ITEM_WITH_QUANTITY':
          // Sipariş geçmişinden ürün ekleme (quantity bilgisi ile)
          const existingItemWithQuantity = state.items.find(item => item.id === action.payload.id);
          if (existingItemWithQuantity) {
            // Yeni bir items array'i oluştur
            const updatedItems = state.items.map(item => {
              if (item.id === action.payload.id) {
                return { ...item, quantity: item.quantity + action.payload.quantity };
              }
              return item;
            });
            
            return {
              ...state,
              items: updatedItems,
              total: updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
            };
          }
          
          // Yeni ürün ekle
          const newItemsWithQuantity = [...state.items, action.payload];
          
          return {
            ...state,
            items: newItemsWithQuantity,
            total: newItemsWithQuantity.reduce((total, item) => total + (item.price * item.quantity), 0)
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

// Admin e-posta listesi - gerçek uygulamada Firestore'da saklanmalı
const ADMIN_EMAILS = ['31@gmail.com', 'osman@gmail.con'];

function TabNavigator() {
  // Kullanıcının admin olup olmadığını kontrol et
  const isAdmin = auth.currentUser && ADMIN_EMAILS.includes(auth.currentUser.email);
  
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
          } else if (route.name === 'AdminTab') {
            iconName = focused ? 'list' : 'list-outline';
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
      
      {/* Admin tab'i sadece admin kullanıcılar için göster */}
      {isAdmin && (
        <Tab.Screen 
          name="AdminTab" 
          component={AdminOrdersScreen} 
          options={{ 
            title: 'Admin Panel',
            tabBarBadge: '!', // Bildirim gibi dikkat çekmesi için
            tabBarBadgeStyle: { backgroundColor: '#E74C3C' }
          }} 
        />
      )}
    </Tab.Navigator>
  );
}

// Uygulama başlatma ekranı bileşeni
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#5D4037" />
  </View>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Firebase oturum durumunu dinle
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    
    // Component unmount olduğunda dinlemeyi durdur
    return () => unsubscribe();
  }, []);
  
  // Yükleme ekranını göster
  if (isLoading) {
    return (
      <Provider store={store}>
        <LoadingScreen />
      </Provider>
    );
  }
  
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            // Kullanıcı giriş yapmışsa ana ekranları göster
            <>
              <Stack.Screen name="Main" component={TabNavigator} />
              {/* Ödeme ekranı sadece giriş yapan kullanıcılar için */}
              <Stack.Screen name="Payment" component={PaymentScreen} />
            </>
          ) : (
            // Kullanıcı giriş yapmamışsa login ve kayıt ekranlarını göster
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});

export default App;

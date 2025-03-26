import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Ekranları import ediyoruz
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MenuScreen from '../screens/MenuScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
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
          options={{ 
            title: 'Giriş Yap',
            headerShown: false 
          }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ 
            title: 'Kayıt Ol',
            headerShown: false 
          }}
        />
        <Stack.Screen 
          name="Menu" 
          component={MenuScreen} 
          options={{ 
            title: 'Kahve Menüsü',
            headerLeft: () => null // Geri dönüş butonunu kaldır
          }}
        />
        <Stack.Screen 
          name="Cart" 
          component={CartScreen} 
          options={{ 
            title: 'Sepetim',
            headerBackTitle: 'Menüye Dön'
          }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ 
            title: 'Profilim',
            headerBackTitle: 'Menüye Dön'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 
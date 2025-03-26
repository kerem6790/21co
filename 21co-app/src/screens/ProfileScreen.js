import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';

const ProfileScreen = ({ navigation }) => {
  const cart = useSelector((state) => state.cart);

  const handleLogout = () => {
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/profile-placeholder.png')} 
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>Test Kullanıcı</Text>
          <Text style={styles.email}>test@test.com</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sepetim</Text>
        {cart.items.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Image source={item.image} style={styles.cartItemImage} />
            <View style={styles.cartItemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>{item.price * item.quantity} ₺</Text>
            </View>
          </View>
        ))}
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Toplam:</Text>
          <Text style={styles.totalAmount}>{cart.total} ₺</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLogo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  cartItemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: '#27AE60',
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen; 
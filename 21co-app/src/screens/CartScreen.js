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

const CartScreen = ({ navigation }) => {
  const cart = useSelector((state) => state.cart);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Sepetim</Text>
      </View>

      <View style={styles.section}>
        {cart.items.length === 0 ? (
          <Text style={styles.emptyCart}>Sepetiniz boş</Text>
        ) : (
          <>
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
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>Siparişi Tamamla</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
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
    padding: 16,
    backgroundColor: '#2C3E50',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#CCCCCC',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  emptyCart: {
    fontSize: 18,
    textAlign: 'center',
    color: '#7F8C8D',
    padding: 20,
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
    color: '#2C3E50',
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
    color: '#2C3E50',
  },
  checkoutButton: {
    backgroundColor: '#2C3E50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen; 
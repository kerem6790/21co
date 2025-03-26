import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useDispatch } from 'react-redux';

const coffeeItems = [
  {
    id: '1',
    name: 'Türk Kahvesi',
    price: 45,
    description: 'Geleneksel Türk kahvesi, yanında lokum ile servis edilir.',
  },
  {
    id: '2',
    name: 'Espresso',
    price: 35,
    description: 'İtalyan usulü hazırlanmış yoğun espresso.',
  },
  {
    id: '3',
    name: 'Latte',
    price: 50,
    description: 'Espresso ve buharla ısıtılmış süt ile hazırlanmış latte.',
  },
  {
    id: '4',
    name: 'Americano',
    price: 40,
    description: 'Espresso ve sıcak su ile hazırlanmış americano.',
  },
];

const MenuScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  const renderItem = ({ item }) => (
    <View style={styles.menuItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.coffeeName}>{item.name}</Text>
        <Text style={styles.coffeeDescription}>{item.description}</Text>
        <Text style={styles.coffeePrice}>{item.price} ₺</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.addButtonText}>Sepete Ekle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={coffeeItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.profileButtonText}>Profil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContainer: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
  },
  coffeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  coffeeDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  coffeePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60',
  },
  addButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  profileButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2C3E50',
    padding: 12,
    borderRadius: 8,
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default MenuScreen; 
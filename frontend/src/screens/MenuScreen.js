import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';

const coffeeItems = [
  {
    id: '1',
    name: 'Türk Kahvesi',
    price: 45,
    image: require('../assets/turkish-coffee.jpg'),
    description: 'Geleneksel Türk kahvesi, yanında lokum ile servis edilir.',
  },
  {
    id: '2',
    name: 'Espresso',
    price: 35,
    image: require('../assets/espresso.jpg'),
    description: 'İtalyan usulü hazırlanmış yoğun espresso.',
  },
  {
    id: '3',
    name: 'Latte',
    price: 50,
    image: require('../assets/latte.jpg'),
    description: 'Espresso ve buharla ısıtılmış süt ile hazırlanmış latte.',
  },
  {
    id: '4',
    name: 'Americano',
    price: 40,
    image: require('../assets/americano.jpg'),
    description: 'Espresso ve sıcak su ile hazırlanmış americano.',
  },
];

const MenuScreen = () => {
  const dispatch = useDispatch();

  const handleAddToCart = (item) => {
    dispatch(addToCart(item));
  };

  const renderItem = ({ item }) => (
    <View style={styles.menuItem}>
      <Image source={item.image} style={styles.coffeeImage} />
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
      <Text style={styles.header}>Kahve Menüsü</Text>
      <FlatList
        data={coffeeItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    color: '#2C3E50',
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
  coffeeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
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
});

export default MenuScreen;

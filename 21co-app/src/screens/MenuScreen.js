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

const coffeeItems = [
  {
    id: '1',
    name: 'Türk Kahvesi',
    price: 45,
    description: 'Geleneksel Türk kahvesi, yanında lokum ile servis edilir.',
    image: require('../../assets/turkish coffe.jpeg'),
  },
  {
    id: '2',
    name: 'Espresso',
    price: 35,
    description: 'İtalyan usulü hazırlanmış yoğun espresso.',
    image: require('../../assets/espresso.jpeg'),
  },
  {
    id: '3',
    name: 'Latte',
    price: 50,
    description: 'Espresso ve buharla ısıtılmış süt ile hazırlanmış latte.',
    image: require('../../assets/latte.jpeg'),
  },
  {
    id: '4',
    name: 'Americano',
    price: 40,
    description: 'Espresso ve sıcak su ile hazırlanmış americano.',
    image: require('../../assets/americano.jpg'),
  },
];

const MenuScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
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
      <View style={styles.header}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>21CO</Text>
      </View>
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
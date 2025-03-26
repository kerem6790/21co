import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';

const ProfileScreen = ({ navigation }) => {
  // Örnek kullanıcı bilgileri
  const user = {
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phone: '+90 555 123 4567',
    address: 'İstanbul, Türkiye',
  };

  const menuItems = [
    {
      title: 'Sipariş Geçmişi',
      icon: '📋',
      onPress: () => {},
    },
    {
      title: 'Favori Kahvelerim',
      icon: '❤️',
      onPress: () => {},
    },
    {
      title: 'Adreslerim',
      icon: '📍',
      onPress: () => {},
    },
    {
      title: 'Bildirim Ayarları',
      icon: '🔔',
      onPress: () => {},
    },
    {
      title: 'Yardım ve Destek',
      icon: '❓',
      onPress: () => {},
    },
    {
      title: 'Çıkış Yap',
      icon: '🚪',
      onPress: () => navigation.replace('Login'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/profile-placeholder.png')}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.phone}>{user.phone}</Text>
        <Text style={styles.address}>{user.address}</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  phone: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  address: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuTitle: {
    fontSize: 16,
    color: '#2C3E50',
  },
});

export default ProfileScreen; 
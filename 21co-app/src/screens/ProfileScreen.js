import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(require('../../assets/profile-placeholder.png'));

  const handleLogout = () => {
    navigation.replace('Login');
  };

  const pickImage = async () => {
    // Kamera iznini kontrol et
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraflarınıza erişmek için izin gereklidir.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage({ uri: result.assets[0].uri });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage}>
          <Image 
            source={profileImage} 
            style={styles.headerLogo}
            resizeMode="cover"
          />
          <View style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Değiştir</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.name}>Test Kullanıcı</Text>
          <Text style={styles.email}>test@test.com</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
        <View style={styles.accountInfoItem}>
          <Text style={styles.accountInfoLabel}>Ad Soyad:</Text>
          <Text style={styles.accountInfoValue}>Test Kullanıcı</Text>
        </View>
        <View style={styles.accountInfoItem}>
          <Text style={styles.accountInfoLabel}>Email:</Text>
          <Text style={styles.accountInfoValue}>test@test.com</Text>
        </View>
        <View style={styles.accountInfoItem}>
          <Text style={styles.accountInfoLabel}>Telefon:</Text>
          <Text style={styles.accountInfoValue}>+90 5XX XXX XX XX</Text>
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
    width: 80,
    height: 80,
    marginRight: 15,
    borderRadius: 40,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 15,
    backgroundColor: 'rgba(44, 62, 80, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
    marginHorizontal: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  accountInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  accountInfoLabel: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  accountInfoValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
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
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(require('../../assets/profile-placeholder.png'));
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Kullanıcı bilgilerini getir
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserData(userData);
            
            // Profil fotoğrafını ayarla (eğer varsa)
            if (userData.profilePhoto) {
              setProfileImage({ uri: userData.profilePhoto });
            }
          } else {
            // Kullanıcı verisi bulunamadı, temel bilgileri auth'tan al
            setUserData({
              name: currentUser.displayName || 'Kullanıcı',
              email: currentUser.email,
              phone: ''
            });
          }
          
          // Sipariş geçmişini getir
          try {
            const ordersRef = collection(db, 'orders');
            const q = query(
              ordersRef, 
              where('userId', '==', currentUser.uid),
              orderBy('timestamp', 'desc')
            );
            
            try {
              const querySnapshot = await getDocs(q);
              const orders = [];
              
              querySnapshot.forEach((doc) => {
                const orderData = doc.data();
                
                // Firestore timestamp'i JavaScript tarihine dönüştür
                let orderDate = "Tarih yok";
                if (orderData.timestamp) {
                  const date = orderData.timestamp.toDate();
                  orderDate = date.toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  });
                }
                
                orders.push({
                  id: orderData.displayOrderCode || doc.id,
                  date: orderDate,
                  total: orderData.totalPrice || 0,
                  status: orderData.status || 'Beklemede',
                  items: orderData.items || []
                });
              });
              
              setOrderHistory(orders);
              console.log("Sipariş geçmişi yüklendi, sipariş sayısı:", orders.length);
            } catch (permissionError) {
              console.error("Sipariş geçmişi yüklenirken hata:", permissionError);
              // Yetki hatası durumunda kullanıcıya bilgi mesajı göster
              Alert.alert(
                "Bilgi", 
                "Sipariş geçmişinize erişim sırasında bir sorun oluştu. Lütfen daha sonra tekrar deneyin.",
                [{ text: "Tamam" }]
              );
            }
          } catch (orderError) {
            console.error("Sipariş geçmişi işlemi sırasında hata:", orderError);
          }
        }
      } catch (error) {
        console.error("Kullanıcı verisi alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      
      // Çıkış işlemi - navigasyon uygulamanın başka bir yerinde Firebase auth değişikliklerine
      // tepki veren bir listener tarafından ele alınmalı
      await signOut(auth);
      console.log("Çıkış işlemi başarılı");
      
      // Loading state'i temizle ve navigasyon yapmayı bırak
      setLoading(false);
      
      // Not: Firebase Auth'daki değişiklik, uygulamanın başındaki bir Auth listener 
      // tarafından algılanacak ve otomatik olarak Login ekranına yönlendirilecek
      
    } catch (error) {
      Alert.alert('Çıkış Hatası', 'Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error("Çıkış hatası:", error);
      setLoading(false);
    }
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
      try {
        const newImageUri = result.assets[0].uri;
        setProfileImage({ uri: newImageUri });
        
        // Profil fotoğrafını Firestore'da güncellemek için burada ek işlemler yapılabilir
        // Bu örnekte sadece yerel state'i güncelliyoruz
        
      } catch (error) {
        console.error("Profil fotoğrafı güncellenirken hata:", error);
        Alert.alert("Hata", "Profil fotoğrafı güncellenirken bir hata oluştu.");
      }
    }
  };

  const handleReorder = (order) => {
    // Sepeti temizle
    dispatch({ type: 'CLEAR_CART' });
    
    // Siparişteki tüm ürünleri sepete ekle
    order.items.forEach(item => {
      // Ürün adına göre doğru resmi seç
      let imageSource;
      const lowerCaseName = item.name.toLowerCase();
      
      if (lowerCaseName.includes('türk')) {
        imageSource = require('../../assets/turkish coffe.jpeg');
      } else if (lowerCaseName.includes('espresso')) {
        imageSource = require('../../assets/espresso.jpeg');
      } else if (lowerCaseName.includes('latte')) {
        imageSource = require('../../assets/latte.jpeg');
      } else if (lowerCaseName.includes('americano')) {
        imageSource = require('../../assets/americano.jpg');
      } else {
        // Varsayılan logo
        imageSource = require('../../assets/logo.png');
      }
      
      // Ürünleri sepete ekle
      const coffeeItem = {
        id: `product-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
        name: item.name,
        price: item.price,
        description: `${item.name} açıklaması.`,
        image: imageSource,
        quantity: item.quantity
      };
      
      // Doğrudan ürünü ekle
      dispatch({ 
        type: 'ADD_ITEM_WITH_QUANTITY', 
        payload: coffeeItem
      });
    });
    
    // Kullanıcıya bildirim göster
    Alert.alert('Sepete Eklendi', 'Önceki siparişiniz sepete eklendi.', [
      {
        text: 'Sepete Git',
        onPress: () => navigation.navigate('Main')
      },
      {
        text: 'Tamam',
        style: 'cancel'
      }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2C3E50" />
        </View>
      ) : (
        <>
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
              <Text style={styles.name}>{userData?.name || 'Kullanıcı'}</Text>
              <Text style={styles.email}>{userData?.email || ''}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
            <View style={styles.accountInfoItem}>
              <Text style={styles.accountInfoLabel}>Ad Soyad:</Text>
              <Text style={styles.accountInfoValue}>{userData?.name || 'Kullanıcı'}</Text>
            </View>
            <View style={styles.accountInfoItem}>
              <Text style={styles.accountInfoLabel}>E-posta:</Text>
              <Text style={styles.accountInfoValue}>{userData?.email || ''}</Text>
            </View>
            <View style={styles.accountInfoItem}>
              <Text style={styles.accountInfoLabel}>Telefon:</Text>
              <Text style={styles.accountInfoValue}>{userData?.phone || 'Belirtilmemiş'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sipariş Geçmişi</Text>
            {orderHistory.length > 0 ? (
              orderHistory.map((order) => (
                <View key={order.id} style={styles.orderItem}>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderId}>Sipariş #{order.id}</Text>
                      <Text style={styles.orderDate}>{order.date}</Text>
                    </View>
                    <View style={styles.orderStatusContainer}>
                      <Text style={styles.orderStatus}>{order.status}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderDetails}>
                    {order.items.map((item, index) => (
                      <View key={index} style={styles.orderItemRow}>
                        <Text style={styles.orderItemName}>
                          {item.quantity}x {item.name}
                        </Text>
                        <Text style={styles.orderItemPrice}>{item.price * item.quantity} ₺</Text>
                      </View>
                    ))}
                    <View style={styles.orderTotal}>
                      <Text style={styles.orderTotalLabel}>Toplam:</Text>
                      <Text style={styles.orderTotalValue}>{order.total} ₺</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.reorderButton}
                    onPress={() => handleReorder(order)}
                  >
                    <Ionicons name="refresh-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.reorderButtonText}> Tekrar Sipariş Ver</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyOrdersContainer}>
                <Ionicons name="cart-outline" size={50} color="#BCAAA4" />
                <Text style={styles.emptyOrdersText}>Henüz sipariş vermediniz</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </>
      )}
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
  orderItem: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  orderId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  orderDate: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  orderStatusContainer: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  orderStatus: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    padding: 12,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderItemName: {
    fontSize: 14,
    color: '#2C3E50',
  },
  orderItemPrice: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
    marginTop: 6,
  },
  orderTotalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  orderTotalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  reorderButton: {
    backgroundColor: '#2C3E50',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyOrdersContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyOrdersText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
  },
});

export default ProfileScreen; 
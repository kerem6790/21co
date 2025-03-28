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
  FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(require('../../assets/profile-placeholder.png'));
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [showCompletedOrders, setShowCompletedOrders] = useState(false);
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
          
          // Sipariş geçmişini gerçek zamanlı dinle
          const ordersRef = collection(db, 'orders');
          const q = query(
            ordersRef, 
            where('userId', '==', currentUser.uid),
            orderBy('timestamp', 'desc')
          );
          
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const orders = [];
            const pending = [];
            const completed = [];
            
            querySnapshot.forEach((doc) => {
              const orderData = doc.data();
              
              // Firestore timestamp'i JavaScript tarihine dönüştür
              let orderDate = "Tarih yok";
              if (orderData.timestamp) {
                const date = orderData.timestamp.toDate();
                orderDate = date.toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }
              
              const orderItem = {
                id: doc.id,
                displayId: orderData.displayOrderCode || doc.id,
                date: orderDate,
                total: orderData.totalPrice || 0,
                status: orderData.status || 'pending',
                items: orderData.items || [],
                timestamp: orderData.timestamp
              };
              
              orders.push(orderItem);
              
              // Siparişleri durumlarına göre ayır
              if (orderData.status === 'pending' || orderData.status === 'ready') {
                pending.push(orderItem);

                // Eğer sipariş hazırsa ve 60 dakika geçmişse otomatik completed yap
                if (orderData.status === 'ready' && orderData.readyTimestamp) {
                  const readyTime = orderData.readyTimestamp.toDate();
                  const now = new Date();
                  const diffMinutes = (now - readyTime) / 1000 / 60;
                  
                  if (diffMinutes > 60 && !orderData.autoCompletePending) {
                    updateDoc(doc.ref, {
                      status: 'completed',
                      completedAt: Timestamp.now(),
                      autoCompleted: true,
                      autoCompletePending: true
                    }).then(() => {
                      console.log(`Sipariş otomatik tamamlandı (60 dk): ${doc.id}`);
                    }).catch(error => {
                      console.error('Otomatik tamamlama hatası:', error);
                    });
                  }
                }
              } else if (orderData.status === 'completed') {
                completed.push(orderItem);
              }
            });
            
            setOrderHistory(orders);
            setPendingOrders(pending);
            setCompletedOrders(completed);
            console.log("Sipariş geçmişi yüklendi, sipariş sayısı:", orders.length);
          });

          // Component unmount olduğunda listener'ı temizle
          return () => unsubscribe();
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

  const handlePickupOrder = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'completed',
        completedAt: Timestamp.now()
      });
      Alert.alert('Başarılı', 'Siparişinizi aldığınızı onayladınız.');
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
      Alert.alert('Hata', 'Sipariş durumu güncellenirken bir hata oluştu.');
    }
  };

  // Sipariş geçmişi görüntüleme fonksiyonu
  const toggleCompletedOrders = () => {
    setShowCompletedOrders(!showCompletedOrders);
  };

  // Sipariş öğesi render fonksiyonu
  const renderOrderItem = ({ item }) => {
    const isReady = item.status === 'ready';
    const isPending = item.status === 'pending';
    
    return (
      <View style={styles.orderItem}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>Sipariş #{item.displayId}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        <View style={styles.orderDetails}>
          <Text style={styles.orderTotal}>Toplam: {item.total} TL</Text>
          <View style={styles.statusContainer}>
            <Text style={[
              styles.orderStatus,
              isReady && styles.readyStatus,
              isPending && styles.pendingStatus
            ]}>
              Durum: {
                item.status === 'pending' ? 'Hazırlanıyor' : 
                item.status === 'ready' ? 'Hazır' :
                item.status === 'cancelled' ? 'İptal Edildi' : 'Tamamlandı'
              }
            </Text>
            {isReady && (
              <View style={styles.readyBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                <Text style={styles.readyText}>Siparişin hazır!</Text>
              </View>
            )}
          </View>
          {isReady && (
            <TouchableOpacity 
              style={styles.pickupButton}
              onPress={() => handlePickupOrder(item.id)}
            >
              <Text style={styles.pickupButtonText}>Siparişimi Aldım</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
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
            <Text style={styles.sectionTitle}>Siparişlerim</Text>
            {pendingOrders.length === 0 ? (
              <Text style={styles.emptyText}>Aktif siparişiniz bulunmuyor.</Text>
            ) : (
              <FlatList
                data={pendingOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>

          <TouchableOpacity 
            style={styles.showOrdersButton}
            onPress={toggleCompletedOrders}
          >
            <Text style={styles.showOrdersButtonText}>
              {showCompletedOrders ? 'Eski Siparişleri Gizle' : 'Eski Siparişleri Göster'}
            </Text>
          </TouchableOpacity>

          {showCompletedOrders && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Eski Siparişlerim</Text>
              {completedOrders.length === 0 ? (
                <Text style={styles.emptyText}>Eski siparişiniz bulunmuyor.</Text>
              ) : (
                <FlatList
                  data={completedOrders}
                  renderItem={renderOrderItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </View>
          )}

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
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2C3E50',
  },
  orderDate: {
    color: '#7F8C8D',
    fontSize: 14,
  },
  orderDetails: {
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 15,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  orderStatus: {
    fontSize: 15,
    color: '#2C3E50',
  },
  readyStatus: {
    color: '#27AE60',
    fontWeight: 'bold',
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F6EF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readyText: {
    color: '#27AE60',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  reorderButton: {
    backgroundColor: '#3498DB',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  reorderButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  showOrdersButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    margin: 15,
  },
  showOrdersButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7F8C8D',
    marginVertical: 15,
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
  pendingStatus: {
    color: '#F39C12',
  },
  pickupButton: {
    backgroundColor: '#27AE60',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  pickupButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 
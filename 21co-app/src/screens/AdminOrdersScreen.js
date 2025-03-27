import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const AdminOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    // Firestore'dan bekleyen siparişleri çek
    const fetchPendingOrders = () => {
      setLoading(true);
      
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef, 
          where('status', '==', 'pending'),
          orderBy('timestamp', 'desc')
        );
        
        // Anlık güncellemeler için onSnapshot kullan
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const ordersData = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Timestamp'i formatlı tarih stringine çevir
            let orderDate = "Tarih yok";
            if (data.timestamp) {
              const date = data.timestamp.toDate();
              orderDate = date.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            }
            
            ordersData.push({
              id: doc.id,
              userId: data.userId,
              totalPrice: data.totalPrice,
              items: data.items || [],
              displayOrderCode: data.displayOrderCode,
              date: orderDate,
              orderCode: data.orderCode,
              status: data.status
            });
          });
          
          setOrders(ordersData);
          setLoading(false);
          console.log("Bekleyen siparişler yüklendi, sayı:", ordersData.length);
        }, (err) => {
          console.error("Siparişleri getirirken hata:", err);
          setError("Siparişleri yüklerken bir hata oluştu.");
          setLoading(false);
        });
        
        // Component unmount olduğunda listener'ı temizle
        return () => unsubscribe();
      } catch (error) {
        console.error("Orders snapshot hatası:", error);
        setError("Sipariş verileri alınamadı. Lütfen daha sonra tekrar deneyin.");
        setLoading(false);
      }
    };
    
    fetchPendingOrders();
  }, []);
  
  const handleMarkAsReady = async (orderId) => {
    setUpdatingOrderId(orderId);
    
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'ready',
        readyAt: Timestamp.now()
      });
      
      console.log("Sipariş durumu güncellendi, ID:", orderId);
      
      // Başarı mesajı göster
      Alert.alert("Başarılı", "Sipariş hazır olarak işaretlendi.");
    } catch (error) {
      console.error("Sipariş güncelleme hatası:", error);
      Alert.alert("Hata", "Sipariş güncellenirken bir hata oluştu.");
    } finally {
      setUpdatingOrderId(null);
    }
  };
  
  const handleCancelOrder = async (orderId) => {
    setUpdatingOrderId(orderId);
    
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        cancelledAt: Timestamp.now()
      });
      
      console.log("Sipariş iptal edildi, ID:", orderId);
      
      // Başarı mesajı göster
      Alert.alert("Başarılı", "Sipariş iptal edildi.");
    } catch (error) {
      console.error("Sipariş iptal hatası:", error);
      Alert.alert("Hata", "Sipariş iptal edilirken bir hata oluştu.");
    } finally {
      setUpdatingOrderId(null);
    }
  };
  
  const renderOrderItem = ({ item }) => {
    const isUpdating = updatingOrderId === item.id;
    
    return (
      <View style={styles.orderItem}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderCode}>Sipariş #{item.displayOrderCode}</Text>
            <Text style={styles.orderDate}>{item.date}</Text>
          </View>
          <View style={styles.orderStatusContainer}>
            <Text style={styles.orderStatus}>{item.status === 'pending' ? 'Bekliyor' : 'Hazır'}</Text>
          </View>
        </View>
        
        <View style={styles.orderInfo}>
          <Text style={styles.orderInfoText}>
            <Text style={styles.infoLabel}>Kullanıcı ID: </Text>
            {item.userId}
          </Text>
          <Text style={styles.orderInfoText}>
            <Text style={styles.infoLabel}>Toplam Tutar: </Text>
            {item.totalPrice} ₺
          </Text>
        </View>
        
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsTitle}>Sipariş İçeriği:</Text>
          {item.items.map((orderItem, index) => (
            <View key={index} style={styles.orderItemRow}>
              <Text style={styles.itemName}>• {orderItem.quantity}x {orderItem.name}</Text>
              <Text style={styles.itemPrice}>{orderItem.price * orderItem.quantity} ₺</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.readyButton, isUpdating && styles.disabledButton]}
            onPress={() => handleMarkAsReady(item.id)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                <Text style={styles.readyButtonText}>Hazırlandı</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.cancelButton, isUpdating && styles.disabledButton]}
            onPress={() => handleCancelOrder(item.id)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" />
                <Text style={styles.cancelButtonText}>İptal Et</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>Siparişler yükleniyor...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#E74C3C" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            // useEffect hookunu tekrar tetiklemek için bileşeni remount etmek gerekebilir
          }}
        >
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cafe-outline" size={50} color="#7F8C8D" />
        <Text style={styles.emptyText}>Bekleyen sipariş bulunmuyor</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bekleyen Siparişler</Text>
      </View>
      
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
    backgroundColor: '#2C3E50',
    padding: 15,
    paddingTop: 45,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  listContainer: {
    padding: 10,
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
  },
  orderCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  orderDate: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  orderStatusContainer: {
    backgroundColor: '#F39C12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  orderStatus: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderInfo: {
    marginBottom: 10,
  },
  orderInfoText: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  itemsContainer: {
    marginBottom: 10,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemName: {
    fontSize: 14,
    color: '#34495E',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  readyButton: {
    backgroundColor: '#27AE60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 8,
  },
  readyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  retryButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#3498DB',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AdminOrdersScreen; 
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OrderCard = ({ order }) => {
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Hazırlanıyor';
      case 'ready':
        return 'Hazır';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#F39C12';
      case 'ready':
        return '#3498DB';
      case 'completed':
        return '#27AE60';
      case 'cancelled':
        return '#E74C3C';
      default:
        return '#7F8C8D';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderNumber}>Sipariş #{order.displayOrderCode}</Text>
        <Text style={styles.orderDate}>{order.timestamp}</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.orderCode}>Sipariş Kodu: <Text style={styles.orderCodeValue}>{order.displayOrderCode}</Text></Text>
        <Text style={styles.orderTotal}>Toplam: {order.totalPrice} ₺</Text>
        <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
          Durum: {getStatusText(order.status)}
        </Text>
      </View>

      <View style={styles.itemsContainer}>
        <Text style={styles.itemsTitle}>Sipariş İçeriği:</Text>
        {order.items?.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>• {item.quantity}x {item.name}</Text>
            <Text style={styles.itemPrice}>{item.price * item.quantity} ₺</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  header: {
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
  details: {
    marginBottom: 8,
  },
  orderCode: {
    fontSize: 15,
    marginBottom: 4,
    color: '#2C3E50',
  },
  orderCodeValue: {
    fontWeight: 'bold',
    color: '#E67E22',
  },
  orderTotal: {
    fontSize: 15,
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemsContainer: {
    marginTop: 8,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  itemRow: {
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
});

export default OrderCard; 
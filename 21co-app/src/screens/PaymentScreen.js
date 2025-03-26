import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';

const PaymentScreen = ({ navigation, route }) => {
  const { total } = route.params;
  const dispatch = useDispatch();
  
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (text) => {
    // Sadece rakamları al
    const cleaned = text.replace(/\D/g, '');
    // Her 4 rakamdan sonra boşluk ekle
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // Max 16 digit + 3 spaces
  };

  const formatExpDate = (text) => {
    // Sadece rakamları al
    const cleaned = text.replace(/\D/g, '');
    // 2 rakamdan sonra eğik çizgi ekle
    const formatted = cleaned.replace(/(\d{2})(?=\d)/g, '$1/');
    return formatted.substring(0, 5); // MM/YY
  };

  const handleCardNumberChange = (text) => {
    setCardNumber(formatCardNumber(text));
  };

  const handleExpDateChange = (text) => {
    setExpDate(formatExpDate(text));
  };

  const handleCvvChange = (text) => {
    // Sadece rakamları al ve 3 karakter ile sınırla
    const cleaned = text.replace(/\D/g, '');
    setCvv(cleaned.substring(0, 3));
  };
  
  const validateForm = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Hata', 'Lütfen geçerli bir kart numarası girin.');
      return false;
    }
    
    if (!expDate || expDate.length < 5) {
      Alert.alert('Hata', 'Lütfen geçerli bir son kullanma tarihi girin (AA/YY).');
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      Alert.alert('Hata', 'Lütfen geçerli bir CVV kodu girin.');
      return false;
    }
    
    if (!name) {
      Alert.alert('Hata', 'Lütfen kart üzerindeki ismi girin.');
      return false;
    }
    
    return true;
  };

  const handlePayment = () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Normalde burada backend'e ödeme isteği gönderilir
    // Şimdilik simüle edelim
    setTimeout(() => {
      setLoading(false);
      
      // Ödeme başarılı olduğunda sepeti temizle
      // (Yeni bir reducer action'ı ekleyebilirsiniz veya sepeti sıfırlayabilirsiniz)
      dispatch({ type: 'CLEAR_CART' });
      
      // Başarılı mesajını göster
      Alert.alert(
        'Ödeme Başarılı',
        'Siparişiniz alındı. Teşekkür ederiz!',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('MenuTab'),
          },
        ]
      );
    }, 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ödeme</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.totalAmount}>Toplam Tutar: {total} ₺</Text>
        
        <Text style={styles.sectionTitle}>Kart Bilgileri</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Kart Numarası"
          value={cardNumber}
          onChangeText={handleCardNumberChange}
          keyboardType="numeric"
          maxLength={19}
        />
        
        <View style={styles.rowInputs}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Son Kullanma (AA/YY)"
            value={expDate}
            onChangeText={handleExpDateChange}
            keyboardType="numeric"
            maxLength={5}
          />
          
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="CVV"
            value={cvv}
            onChangeText={handleCvvChange}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Kart Üzerindeki İsim"
          value={name}
          onChangeText={setName}
          autoCapitalize="characters"
        />
        
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>Ödemeyi Tamamla</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>İptal</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C3E50',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  payButton: {
    backgroundColor: '#27AE60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default PaymentScreen; 
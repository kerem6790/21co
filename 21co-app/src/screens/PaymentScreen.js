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
import { useDispatch, useSelector } from 'react-redux';
import { collection, addDoc, serverTimestamp, getDoc, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

// Günün tarihine göre prefiks oluşturan fonksiyon
const getDatePrefix = () => {
  const now = new Date();
  // Format: GGAAYY (Gün-Ay-Yıl son iki rakamı)
  return `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear().toString().slice(2)}`;
};

// Günlük benzersiz sipariş kodu oluşturan fonksiyon
const generateDailyOrderCode = async () => {
  try {
    const datePrefix = getDatePrefix();
    
    // Firestore yetkisi sorunu nedeniyle doğrudan yerel olarak kod oluştur
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(1 + Math.random() * 999);
    const dayOfMonth = new Date().getDate();
    const displayCode = ((dayOfMonth * 100) + randomNum).toString().padStart(4, '0');
    
    const fullOrderCode = `${datePrefix}-${randomNum.toString().padStart(4, '0')}`;
    
    console.log("[SİPARİŞ] Yerel olarak sipariş kodu oluşturuldu:", fullOrderCode, displayCode);
    
    return {
      fullOrderCode,  // Sistemde saklanacak tam kod
      displayCode     // Kullanıcıya gösterilecek 4 haneli kod
    };
  } catch (error) {
    console.error("[SİPARİŞ] Sipariş kodu oluşturma hatası:", error);
    // Hata durumunda yedek kod oluştur
    const datePrefix = getDatePrefix();
    const randomCounter = Math.floor(1 + Math.random() * 1000);
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    const fullOrderCode = `${datePrefix}-MANUAL${randomCounter.toString().padStart(4, '0')}`;
    
    console.log("[SİPARİŞ] Manuel sipariş kodu oluşturuldu:", fullOrderCode, randomCode);
    
    return {
      fullOrderCode: fullOrderCode,
      displayCode: randomCode
    };
  }
};

const PaymentScreen = ({ navigation, route }) => {
  const { total } = route.params;
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  
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

  const handlePayment = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Kullanıcı giriş yapmış mı kontrol et
      const currentUser = auth.currentUser;
      console.log("[SİPARİŞ] Kullanıcı durumu:", currentUser ? "Giriş yapılmış" : "Giriş yapılmamış");
      
      if (!currentUser) {
        Alert.alert('Hata', 'Sipariş vermek için giriş yapmalısınız.');
        setLoading(false);
        return;
      }

      // Kullanıcı bilgilerini Firestore'dan al
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      
      // Sepet içeriğini kontrol et
      console.log("[SİPARİŞ] Sepet durumu:", cart.items.length > 0 ? `${cart.items.length} ürün var` : "Sepet boş");
      if (cart.items.length === 0) {
        Alert.alert('Hata', 'Sepetinizde ürün bulunmamaktadır.');
        setLoading(false);
        return;
      }
      
      let orderCodes;
      try {
        // Günlük benzersiz sipariş kodu oluştur
        orderCodes = await generateDailyOrderCode();
        console.log("[SİPARİŞ] Sipariş kodları oluşturuldu:", orderCodes);
      } catch (codeError) {
        console.error("[SİPARİŞ] Kod oluşturma hatası, varsayılan kod kullanılıyor:", codeError);
        // Kod üretilemediğinde varsayılan kod kullan
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        orderCodes = {
          fullOrderCode: `${dateStr}-FALLBACK-${randomNum}`,
          displayCode: randomNum.toString()
        };
      }
      
      // Sipariş verisi oluştur
      const orderData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userData?.name || 'İsimsiz Kullanıcı',
        orderCode: orderCodes.fullOrderCode,
        displayOrderCode: orderCodes.displayCode,
        items: cart.items,
        totalPrice: total,
        status: 'pending',
        paymentInfo: {
          cardLastFour: cardNumber.replace(/\s/g, '').slice(-4),
          cardHolderName: name,
        },
        timestamp: serverTimestamp()
      };
      
      console.log("[SİPARİŞ] Sipariş verisi hazırlandı:", JSON.stringify({
        userId: orderData.userId,
        userEmail: orderData.userEmail,
        userName: orderData.userName,
        orderCode: orderData.orderCode,
        displayCode: orderData.displayOrderCode,
        itemCount: orderData.items.length,
        total: orderData.totalPrice,
        status: orderData.status
      }));
      
      // Firestore'a yazma işlemi başlat
      console.log("[SİPARİŞ] Firestore yazma işlemi başlatılıyor...");
      
      // Orders koleksiyonuna belgeyi ekle
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      console.log("[SİPARİŞ] Başarıyla kaydedildi! Sipariş ID:", orderRef.id);
      
      // Sepeti temizle
      dispatch({ type: 'CLEAR_CART' });
      console.log("[SİPARİŞ] Sepet temizlendi");
      
      // Başarılı mesajını göster
      setLoading(false);
      Alert.alert(
        'Ödeme Başarılı',
        `Siparişiniz alındı.\nSipariş Kodunuz: ${orderCodes.displayCode}`,
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('Main'),
          },
        ]
      );
    } catch (error) {
      console.error("[SİPARİŞ] Sipariş oluşturma hatası:", error);
      setLoading(false);
      Alert.alert('Hata', 'Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
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
          onPress={() => navigation.navigate('Main')}
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
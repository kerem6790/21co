import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Basit validasyon kontrolleri
    if (!email || !password || !confirmPassword) {
      Alert.alert('Hata', 'E-posta ve şifre alanları zorunludur');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    
    // Timeout kontrolü için değişken
    let isTimeout = false;
    let timeoutId = setTimeout(() => {
      isTimeout = true;
      setLoading(false);
      Alert.alert(
        'Zaman Aşımı', 
        'İşlem çok uzun sürdü. İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    }, 15000); // 15 saniye timeout
    
    try {
      console.log("Firebase kayıt işlemi başlıyor");
      
      // Firebase ile yeni kullanıcı oluşturma
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("Firebase kullanıcı oluşturuldu");
      
      // *****************************
      // ÖNEMLİ: Firestore çağrısını atla
      // *****************************
      /*
      try {
        // Kullanıcı bilgilerini Firestore'a kaydetme (iç try-catch ile)
        await setDoc(doc(db, "users", user.uid), {
          name: name || 'Kullanıcı', 
          email: email,
          phone: phone || '',
          createdAt: new Date(),
        });
        console.log("Firestore kaydı tamamlandı");
      } catch (firestoreError) {
        // Firestore hatası olsa bile kullanıcı oluşturuldu, bu nedenle başarılı sayılabilir
        console.error("Firestore kaydı hatası:", firestoreError);
        console.log("Firestore kaydı başarısız oldu, ancak kullanıcı oluşturuldu");
      }
      */
      
      // Timeout'u temizle
      clearTimeout(timeoutId);
      if (isTimeout) return; // Timeout olduysa işlemi burada sonlandır
      
      // Başarılı kayıt sonrası çıkış yap (otomatik giriş olmaması için)
      await signOut(auth);
      
      // Yükleme göstergesini kaldır
      setLoading(false);
      
      // Başarılı kayıt mesajı göster
      Alert.alert(
        'Başarılı',
        'Kayıt işlemi tamamlandı. Giriş yapabilirsiniz.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('Login')
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      // Timeout'u temizle
      clearTimeout(timeoutId);
      if (isTimeout) return; // Timeout olduysa işlemi burada sonlandır
      
      // Hata durumunda kullanıcıya bildir
      console.error("Kayıt hatası:", error.code, error.message);
      
      // Yükleme göstergesini kaldır
      setLoading(false);
      
      let errorMessage = 'Kayıt olurken bir hata oluştu.';
      
      switch(error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Bu email adresi zaten kullanımda.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz email formatı.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Şifre yeterince güçlü değil.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/şifre girişi devre dışı bırakılmış.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Ağ hatası. İnternet bağlantınızı kontrol edin.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Geçersiz kullanıcı bilgileri.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.';
          break;
        case 'auth/internal-error':
          errorMessage = 'Firebase iç hatası. Lütfen daha sonra tekrar deneyin.';
          break;
        case 'auth/missing-email':
          errorMessage = 'Lütfen bir email adresi girin.';
          break;
        case 'auth/admin-restricted-operation':
          errorMessage = 'Bu işlem yönetici tarafından kısıtlanmış.';
          break;
        case 'auth/missing-password':
          errorMessage = 'Lütfen bir şifre girin.';
          break;
        case 'auth/app-not-authorized':
          errorMessage = 'Bu uygulama Firebase kullanımı için yetkilendirilmemiş.';
          break;
        case 'auth/invalid-api-key':
          errorMessage = 'API anahtarı geçersiz. Lütfen yönetici ile iletişime geçin.';
          break;
        case 'auth/app-not-installed':
          errorMessage = 'Firebase uygulaması cihazda kurulu değil.';
          break;
        default:
          errorMessage = `Kayıt hatası: ${error.code} - ${error.message}`;
          break;
      }
      
      Alert.alert('Kayıt Hatası', errorMessage);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>21CO</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ad Soyad (isteğe bağlı)"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="E-posta Adresi *"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Telefon Numarası (isteğe bağlı)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre *"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre Tekrar *"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        <Text style={styles.requiredFieldsNote}>* Zorunlu alanlar</Text>

        <TouchableOpacity 
          style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.registerButtonText}>Kaydol</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={styles.loginLinkText}>
            Zaten hesabınız var mı? Giriş yapın
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 10,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButton: {
    backgroundColor: '#2C3E50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonDisabled: {
    backgroundColor: '#7F8C8D',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  loginLinkText: {
    color: '#2C3E50',
    fontSize: 14,
  },
  requiredFieldsNote: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
    marginBottom: 10,
  },
});

export default RegisterScreen; 
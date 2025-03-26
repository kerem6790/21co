import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  useEffect(() => {
    // Uygulama açıldığında, önceden kaydedilmiş kullanıcı bilgilerini kontrol et
    const checkSavedCredentials = async () => {
      try {
        setLoading(true);
        const savedEmail = await AsyncStorage.getItem('userEmail');
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');
        
        if (savedEmail && savedRememberMe === 'true') {
          setEmail(savedEmail);
          setRememberMe(true);
          
          // Kullanıcı oturumu hala aktifse doğrudan ana sayfaya yönlendir
          const currentUser = auth.currentUser;
          if (currentUser) {
            navigation.replace('Main');
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Kaydedilmiş kullanıcı bilgisi alınamadı:', error);
        setLoading(false);
      }
    };
    
    checkSavedCredentials();
  }, [navigation]);
  
  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Hata', 'Lütfen email adresinizi girin.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Hata', 'Lütfen şifrenizi girin.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Firebase'de kalıcı oturum ayarla
      if (rememberMe) {
        await setPersistence(auth, browserLocalPersistence);
      }
      
      // Kullanıcı girişi
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Kullanıcı giriş yaptı:', userCredential.user.email);
      
      // Oturum açık kalsın işaretliyse, email'i kaydet
      if (rememberMe) {
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        // İşaretli değilse bilgileri temizle
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.setItem('rememberMe', 'false');
      }
      
      // Ana sayfaya yönlendir
      navigation.replace('Main');
    } catch (error) {
      let errorMessage = 'Giriş başarısız. Lütfen tekrar deneyin.';
      
      // Hata kodlarına göre özel mesajlar
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz email adresi.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Email veya şifre yanlış.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Bu kullanıcı hesabı devre dışı bırakılmış.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Yanlış şifre girdiniz.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
      }
      
      console.error('Giriş hatası:', error.code, error.message);
      Alert.alert('Giriş Hatası', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>21Co Coffee</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={styles.rememberMeContainer} 
            onPress={() => setRememberMe(!rememberMe)}
          >
            <Ionicons 
              name={rememberMe ? "checkbox" : "square-outline"} 
              size={24} 
              color="#5D4037" 
            />
            <Text style={styles.rememberMeText}>Oturum açık kalsın</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>Hesabınız yok mu? Kaydolun</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
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
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  rememberMeText: {
    marginLeft: 8,
    color: '#5D4037',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2C3E50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#BCAAA4',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 20,
  },
  registerText: {
    color: '#5D4037',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen; 
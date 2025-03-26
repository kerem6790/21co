import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen email ve şifre alanlarını doldurun.');
      return;
    }

    setLoading(true);
    
    try {
      console.log("Firebase ile giriş yapılıyor...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Giriş başarılı!");
      
      // Kullanıcı bilgileri doğru, ana sayfaya yönlendir
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }]
      });
      
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error.code, error.message);
      
      let errorMessage = 'Giriş yapılırken bir hata oluştu.';
      
      switch(error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz email formatı.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Bu kullanıcı hesabı devre dışı bırakılmış.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Bu email ile kayıtlı kullanıcı bulunamadı.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Hatalı şifre.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Geçersiz kullanıcı bilgileri. Email veya şifre hatalı.';
          break;
        case 'auth/invalid-password':
          errorMessage = 'Şifre geçersiz veya eksik.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Ağ hatası. İnternet bağlantınızı kontrol edin.';
          break;
        default:
          errorMessage = `Giriş hatası: ${error.message}`;
      }
      
      Alert.alert('Giriş Başarısız', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>21CO</Text>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
          disabled={loading}
        >
          <Text style={styles.registerLinkText}>
            Hesabınız yok mu? Kaydolun
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 40,
  },
  formContainer: {
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
  loginButton: {
    backgroundColor: '#2C3E50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#7F8C8D',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  registerLinkText: {
    color: '#2C3E50',
    fontSize: 14,
  },
});

export default LoginScreen; 
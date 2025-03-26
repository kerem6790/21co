# 21co - Mobil Kahve Sipariş Uygulaması

## Proje Açıklaması
21co, kullanıcıların favori kahve dükkanlarından kolayca sipariş verebilmelerini sağlayan modern bir mobil uygulamadır. Kullanıcılar menüyü görüntüleyebilir, özel kahve siparişleri oluşturabilir, ödeme yapabilir ve siparişlerini takip edebilirler.

## Kullanılan Teknolojiler

### Frontend
- React Native
- Redux Toolkit
- React Navigation
- Styled Components
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Socket.io

## Kurulum Talimatları

### Frontend Kurulumu
1. Projeyi klonlayın:
```bash
git clone https://github.com/yourusername/21co.git
cd 21co/frontend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm start
```

4. iOS için:
```bash
cd ios
pod install
cd ..
npm run ios
```

5. Android için:
```bash
npm run android
```

### Backend Kurulumu
1. Backend dizinine gidin:
```bash
cd 21co/backend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Ortam değişkenlerini ayarlayın:
```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Katkıda Bulunma Rehberi
1. Bu depoyu fork edin
2. Yeni bir özellik dalı oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add some amazing feature'`)
4. Dalınıza push yapın (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

### Kod Standartları
- ESLint ve Prettier kurallarına uyun
- Her yeni özellik için test yazın
- Commit mesajlarınızı açıklayıcı yazın
- PR açıklamalarınızda değişikliklerinizi detaylı açıklayın

## Lisans
Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

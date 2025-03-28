import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { getDoc, doc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log("[SİPARİŞ] Kullanıcı durumu: Giriş yapılmamış");
          return;
        }

        console.log("[SİPARİŞ] Kullanıcı durumu: Giriş yapılmış");

        // Kullanıcı verilerini getir
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        // Sipariş geçmişini getir
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef, 
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc')
        );
        
        // Gerçek zamanlı dinleme için onSnapshot kullan
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
                year: 'numeric'
              });
            }
            
            const orderItem = {
              id: orderData.displayOrderCode || doc.id,
              date: orderDate,
              total: orderData.totalPrice || 0,
              status: orderData.status || 'Beklemede',
              items: orderData.items || []
            };
            
            orders.push(orderItem);
            
            // Siparişleri durumlarına göre ayır
            if (orderData.status === 'pending') {
              pending.push(orderItem);
            } else if (orderData.status === 'completed' || orderData.status === 'ready') {
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
      } catch (error) {
        console.error("Veri getirme hatası:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default ProfileScreen; 
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  CircularProgress,
  ButtonGroup,
  Alert,
} from '@mui/material';
import { CheckCircle, Cancel, Logout, History } from '@mui/icons-material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { Timestamp } from 'firebase/firestore';

const AdminPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (tabValue === 0) {
      // Bekleyen siparişleri dinle
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef, 
        where('status', '==', 'pending'),
        orderBy('timestamp', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ordersData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          ordersData.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate().toLocaleString('tr-TR') || 'Tarih yok'
          });
        });
        setOrders(ordersData);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Tüm siparişleri getir (pending hariç)
      const fetchAllOrders = async () => {
        setLoading(true);
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef, 
          where('status', 'in', ['completed', 'cancelled', 'ready']),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const ordersData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          ordersData.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate().toLocaleString('tr-TR') || 'Tarih yok'
          });
        });
        setOrders(ordersData);
        setLoading(false);
      };

      fetchAllOrders();
    }
  }, [tabValue]);

  const handleMarkAsReady = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'ready',
        readyTimestamp: Timestamp.now()
      });
      console.log('Sipariş hazır olarak işaretlendi:', orderId);
      setSnackbar({ open: true, message: 'Sipariş hazır olarak işaretlendi', severity: 'success' });
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
      setSnackbar({ open: true, message: 'Sipariş durumu güncellenirken bir hata oluştu', severity: 'error' });
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'cancelled'
      });
    } catch (error) {
      console.error('Sipariş iptal edilirken hata:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Hazırlanması Gerekiyor';
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

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {tabValue === 0 ? 'Hazırlanması Gereken Siparişler' : 'Tüm Siparişler'}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<History />}
            onClick={() => handleTabChange(null, tabValue === 0 ? 1 : 0)}
            sx={{ mr: 2 }}
          >
            {tabValue === 0 ? 'Tüm Siparişler' : 'Hazırlanması Gerekenler'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
          >
            Çıkış Yap
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sipariş No</TableCell>
                <TableCell>Müşteri Bilgileri</TableCell>
                <TableCell>Ürünler</TableCell>
                <TableCell>Toplam Fiyat</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>Durum</TableCell>
                {tabValue === 0 && <TableCell>İşlemler</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.displayOrderCode}</TableCell>
                  <TableCell>
                    <div>E-posta: {order.userEmail || 'Bilgi Yok'}</div>
                    <div>Ad Soyad: {order.userName || 'Bilgi Yok'}</div>
                  </TableCell>
                  <TableCell>
                    {order.items?.map((item, index) => (
                      <div key={index}>
                        {item.quantity}x {item.name}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>{order.totalPrice} ₺</TableCell>
                  <TableCell>{order.timestamp}</TableCell>
                  <TableCell>{getStatusText(order.status)}</TableCell>
                  {tabValue === 0 && (
                    <TableCell>
                      <ButtonGroup variant="contained" size="small">
                        <Button
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleMarkAsReady(order.id)}
                        >
                          Hazır
                        </Button>
                        <Button
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          İptal
                        </Button>
                      </ButtonGroup>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={tabValue === 0 ? 7 : 6} align="center">
                    {tabValue === 0 ? 'Hazırlanması gereken sipariş bulunmuyor' : 'Tamamlanmış veya iptal edilmiş sipariş bulunmuyor'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default AdminPanel; 
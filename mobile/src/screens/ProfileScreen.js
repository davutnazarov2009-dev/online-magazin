import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');

      if (!userId) {
        navigation.navigate('Auth');
        return;
      }

      const response = await axios.get(`${API_URL}/users/profile/${userId}`);
      setUser(response.data);

      // Siparişleri yükle
      const ordersResponse = await axios.get(`${API_URL}/orders/user/${userId}`);
      setOrders(ordersResponse.data);
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('token');
    navigation.navigate('Auth');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Giriş Yapmanız Gerekli</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.phone && <Text style={styles.phone}>{user.phone}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Siparişlerim ({orders.length})</Text>
        {orders.map((order) => (
          <View key={order._id} style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Text style={styles.orderId}>Sipariş #{order._id.slice(-6)}</Text>
              <Text style={styles.orderStatus}>{order.status}</Text>
            </View>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString('tr-TR')}
            </Text>
            <Text style={styles.orderTotal}>{order.totalPrice} ₺</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
      >
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    backgroundColor: '#FF6B35',
    padding: 20,
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    color: '#fff',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 12,
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF6B35',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalBookings: 0,
    totalUsers: 0,
    revenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get total movies
        const moviesSnapshot = await getDocs(collection(db, "movies"));
        const totalMovies = moviesSnapshot.size;

        // Get total bookings and calculate revenue
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));
        const totalBookings = bookingsSnapshot.size;
        let revenue = 0;
        bookingsSnapshot.forEach((doc) => {
          revenue += doc.data().totalPrice || 0;
        });

        // Get total users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const totalUsers = usersSnapshot.size;

        // Get recent bookings
        const recentBookingsQuery = query(
          collection(db, "bookings"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
        const recentBookingsList = recentBookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        setStats({
          totalMovies,
          totalBookings,
          totalUsers,
          revenue,
        });

        setRecentBookings(recentBookingsList);
      } catch (error) {
        console.error("Error fetching dashboard data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mock data for when Firestore doesn't have data yet
  const mockStats = {
    totalMovies: 12,
    totalBookings: 156,
    totalUsers: 87,
    revenue: 2340.5,
  };

  const mockRecentBookings = [
    {
      id: "1",
      movieTitle: "Inception",
      userId: "user123",
      totalPrice: 38.97,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "2",
      movieTitle: "The Dark Knight",
      userId: "user456",
      totalPrice: 25.98,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      id: "3",
      movieTitle: "Interstellar",
      userId: "user789",
      totalPrice: 51.96,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  ];

  const displayStats = stats.totalMovies > 0 ? stats : mockStats;
  const displayRecentBookings =
    recentBookings.length > 0 ? recentBookings : mockRecentBookings;

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogout = async () => {
    try {
      global.isAdminUser = false;
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#E50914" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{displayStats.totalMovies}</Text>
            <Text style={styles.statLabel}>Movies</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{displayStats.totalBookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{displayStats.totalUsers}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              ${displayStats.revenue.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Bookings")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {displayRecentBookings.map((booking, index) => (
            <View key={booking.id} style={styles.bookingItem}>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingTitle}>{booking.movieTitle}</Text>
                <Text style={styles.bookingMeta}>
                  User ID: {booking.userId?.substring(0, 8) || "N/A"} • $
                  {booking.totalPrice?.toFixed(2) || "0.00"}
                </Text>
              </View>
              <Text style={styles.bookingDate}>
                {formatDate(booking.createdAt)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("AdminMovieForm")}
            >
              <Ionicons name="add-circle" size={24} color="#E50914" />
              <Text style={styles.actionText}>Add Movie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Movies")}
            >
              <Ionicons name="film" size={24} color="#E50914" />
              <Text style={styles.actionText}>Manage Movies</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Showtimes")}
            >
              <Ionicons name="calendar" size={24} color="#E50914" />
              <Text style={styles.actionText}>Manage Showtimes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Users")}
            >
              <Ionicons name="people" size={24} color="#E50914" />
              <Text style={styles.actionText}>Manage Users</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E50914",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllText: {
    color: "#E50914",
    fontWeight: "500",
  },
  bookingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  bookingMeta: {
    fontSize: 12,
    color: "#666",
  },
  bookingDate: {
    fontSize: 12,
    color: "#666",
  },
  quickActions: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 15,
  },
  actionButton: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  actionText: {
    marginTop: 8,
    fontWeight: "500",
  },
});

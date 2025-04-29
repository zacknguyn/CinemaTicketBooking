import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const q = query(
          collection(db, "bookings"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const bookingsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        setBookings(bookingsList);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Mock data if Firestore doesn't have data yet
  const mockBookings = [
    {
      id: "1",
      userId: "user123",
      movieTitle: "Inception",
      date: "Wed, 15 May",
      time: "8:00 PM",
      seats: ["C4", "C5", "C6"],
      totalPrice: 38.97,
      status: "confirmed",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      id: "2",
      userId: "user456",
      movieTitle: "The Dark Knight",
      date: "Fri, 17 May",
      time: "6:30 PM",
      seats: ["D8", "D9"],
      totalPrice: 25.98,
      status: "confirmed",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      id: "3",
      userId: "user789",
      movieTitle: "Interstellar",
      date: "Sat, 25 May",
      time: "7:00 PM",
      seats: ["F3", "F4", "F5", "F6"],
      totalPrice: 51.96,
      status: "pending",
      createdAt: new Date(),
    },
  ];

  const displayBookings = bookings.length > 0 ? bookings : mockBookings;

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUpdateStatus = (bookingId, currentStatus) => {
    const newStatus = currentStatus === "confirmed" ? "cancelled" : "confirmed";

    Alert.alert("Update Status", `Change status to ${newStatus}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Update",
        onPress: async () => {
          try {
            await updateDoc(doc(db, "bookings", bookingId), {
              status: newStatus,
            });

            // Update local state
            setBookings((prevBookings) =>
              prevBookings.map((booking) =>
                booking.id === bookingId
                  ? { ...booking, status: newStatus }
                  : booking
              )
            );

            Alert.alert("Success", "Booking status updated");
          } catch (error) {
            console.error("Error updating booking: ", error);
            Alert.alert("Error", "Failed to update booking status");
          }
        },
      },
    ]);
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.movieTitle}>{item.movieTitle}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === "confirmed"
              ? styles.confirmedBadge
              : item.status === "cancelled"
              ? styles.cancelledBadge
              : styles.pendingBadge,
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>User ID:</Text>
          <Text style={styles.detailValue}>
            {item.userId?.substring(0, 8) || "N/A"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date & Time:</Text>
          <Text style={styles.detailValue}>
            {item.date}, {item.time}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Seats:</Text>
          <Text style={styles.detailValue}>
            {Array.isArray(item.seats) ? item.seats.join(", ") : item.seats}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Price:</Text>
          <Text style={styles.detailValue}>
            ${item.totalPrice?.toFixed(2) || "0.00"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Booking ID:</Text>
          <Text style={styles.detailValue}>
            {item.id.substring(0, 8).toUpperCase()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Booked on:</Text>
          <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            item.status === "confirmed"
              ? styles.cancelButton
              : styles.confirmButton,
          ]}
          onPress={() => handleUpdateStatus(item.id, item.status)}
        >
          <Text style={styles.actionButtonText}>
            {item.status === "confirmed" ? "Cancel Booking" : "Confirm Booking"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Bookings</Text>
      </View>

      <FlatList
        data={displayBookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.bookingsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
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
  bookingsList: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  confirmedBadge: {
    backgroundColor: "#e6f7ed",
  },
  pendingBadge: {
    backgroundColor: "#fff9e6",
  },
  cancelledBadge: {
    backgroundColor: "#ffebee",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  bookingDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    width: 100,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    flex: 1,
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  actionButton: {
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#e6f7ed",
  },
  cancelButton: {
    backgroundColor: "#ffebee",
  },
  actionButtonText: {
    fontWeight: "500",
  },
});

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AdminShowtimesScreen() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [price, setPrice] = useState("12.99");

  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch movies
        const moviesSnapshot = await getDocs(collection(db, "movies"));
        const moviesList = moviesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMovies(moviesList);

        // Fetch showtimes
        const showtimesSnapshot = await getDocs(collection(db, "showtimes"));
        const showtimesList = showtimesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date(),
        }));
        setShowtimes(showtimesList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mock data if Firestore doesn't have data yet
  const mockMovies = [
    { id: "1", title: "Inception" },
    { id: "2", title: "The Dark Knight" },
    { id: "3", title: "Interstellar" },
    { id: "4", title: "Pulp Fiction" },
  ];

  const mockShowtimes = [
    {
      id: "1",
      movieId: "1",
      movieTitle: "Inception",
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      time: "18:00",
      price: 12.99,
    },
    {
      id: "2",
      movieId: "1",
      movieTitle: "Inception",
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      time: "21:00",
      price: 14.99,
    },
    {
      id: "3",
      movieId: "2",
      movieTitle: "The Dark Knight",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // day after tomorrow
      time: "19:30",
      price: 12.99,
    },
  ];

  const displayMovies = movies.length > 0 ? movies : mockMovies;
  const displayShowtimes = showtimes.length > 0 ? showtimes : mockShowtimes;

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    if (typeof time === "string") return time;
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleAddShowtime = async () => {
    if (!selectedMovie) {
      Alert.alert("Error", "Please select a movie");
      return;
    }

    try {
      const showtimeData = {
        movieId: selectedMovie.id,
        movieTitle: selectedMovie.title,
        date: selectedDate,
        time: formatTime(selectedTime),
        price: parseFloat(price) || 12.99,
      };

      await addDoc(collection(db, "showtimes"), showtimeData);

      // Update local state
      setShowtimes([
        ...showtimes,
        { id: Date.now().toString(), ...showtimeData },
      ]);

      // Reset form and close modal
      setModalVisible(false);
      setSelectedMovie(null);
      setSelectedDate(new Date());
      setSelectedTime(new Date());
      setPrice("12.99");

      Alert.alert("Success", "Showtime added successfully");
    } catch (error) {
      console.error("Error adding showtime: ", error);
      Alert.alert("Error", "Failed to add showtime");
    }
  };

  const handleDeleteShowtime = (showtimeId) => {
    Alert.alert(
      "Delete Showtime",
      "Are you sure you want to delete this showtime?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "showtimes", showtimeId));
              setShowtimes((prevShowtimes) =>
                prevShowtimes.filter((st) => st.id !== showtimeId)
              );
              Alert.alert("Success", "Showtime deleted successfully");
            } catch (error) {
              console.error("Error deleting showtime: ", error);
              Alert.alert("Error", "Failed to delete showtime");
            }
          },
        },
      ]
    );
  };

  const renderShowtimeItem = ({ item }) => (
    <View style={styles.showtimeCard}>
      <View style={styles.showtimeInfo}>
        <Text style={styles.movieTitle}>{item.movieTitle}</Text>
        <Text style={styles.showtimeDate}>{formatDate(item.date)}</Text>
        <Text style={styles.showtimeTime}>{item.time}</Text>
        <Text style={styles.showtimePrice}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteShowtime(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#E50914" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Showtimes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayShowtimes}
        renderItem={renderShowtimeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.showtimesList}
      />

      {/* Add Showtime Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Showtime</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Movie</Text>
              <View style={styles.movieSelector}>
                {displayMovies.map((movie) => (
                  <TouchableOpacity
                    key={movie.id}
                    style={[
                      styles.movieOption,
                      selectedMovie?.id === movie.id &&
                        styles.selectedMovieOption,
                    ]}
                    onPress={() => setSelectedMovie(movie)}
                  >
                    <Text
                      style={[
                        styles.movieOptionText,
                        selectedMovie?.id === movie.id &&
                          styles.selectedMovieOptionText,
                      ]}
                    >
                      {movie.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{formatDate(selectedDate)}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setSelectedDate(date);
                  }}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text>{formatTime(selectedTime)}</Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="default"
                  onChange={(event, time) => {
                    setShowTimePicker(false);
                    if (time) setSelectedTime(time);
                  }}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ticket Price ($)</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="12.99"
              />
            </View>

            <TouchableOpacity
              style={styles.addShowtimeButton}
              onPress={handleAddShowtime}
            >
              <Text style={styles.addShowtimeButtonText}>Add Showtime</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: "#E50914",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  showtimesList: {
    padding: 15,
  },
  showtimeCard: {
    flexDirection: "row",
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
  showtimeInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  showtimeDate: {
    fontSize: 14,
    color: "#555",
  },
  showtimeTime: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 5,
  },
  showtimePrice: {
    fontSize: 14,
    color: "#E50914",
    fontWeight: "500",
    marginTop: 5,
  },
  deleteButton: {
    justifyContent: "center",
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  movieSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  movieOption: {
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    padding: 8,
    margin: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedMovieOption: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },
  movieOptionText: {
    fontSize: 14,
  },
  selectedMovieOptionText: {
    color: "white",
    fontWeight: "500",
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  addShowtimeButton: {
    backgroundColor: "#E50914",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  addShowtimeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

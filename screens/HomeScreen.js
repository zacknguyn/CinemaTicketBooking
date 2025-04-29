import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";

export default function HomeScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "movies"));
        const moviesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMovies(moviesList);
      } catch (error) {
        console.error("Error fetching movies: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // If we don't have any movies in Firebase yet, show some mock data
  const mockMovies = [
    {
      id: "1",
      title: "Inception",
      poster: "https://via.placeholder.com/300x450?text=Inception",
      genre: "Sci-Fi, Action",
      duration: "148 min",
      rating: 8.8,
    },
    {
      id: "2",
      title: "The Dark Knight",
      poster: "https://via.placeholder.com/300x450?text=Dark+Knight",
      genre: "Action, Crime, Drama",
      duration: "152 min",
      rating: 9.0,
    },
    {
      id: "3",
      title: "Interstellar",
      poster: "https://via.placeholder.com/300x450?text=Interstellar",
      genre: "Adventure, Drama, Sci-Fi",
      duration: "169 min",
      rating: 8.6,
    },
    {
      id: "4",
      title: "Pulp Fiction",
      poster: "https://via.placeholder.com/300x450?text=Pulp+Fiction",
      genre: "Crime, Drama",
      duration: "154 min",
      rating: 8.9,
    },
  ];

  const displayMovies = movies.length > 0 ? movies : mockMovies;

  const renderMovieItem = ({ item }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => navigation.navigate("MovieDetail", { movie: item })}
    >
      <Image source={{ uri: item.poster }} style={styles.poster} />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{item.title}</Text>
        <Text style={styles.movieGenre}>{item.genre}</Text>
        <View style={styles.movieMeta}>
          <Text style={styles.movieDuration}>{item.duration}</Text>
          <Text style={styles.movieRating}>⭐ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Now Showing</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.bookingsButton}
            onPress={() => navigation.navigate("Bookings")}
          >
            <Text style={styles.bookingsButtonText}>My Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E50914" style={styles.loader} />
      ) : (
        <FlatList
          data={displayMovies}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.moviesList}
        />
      )}
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
  },
  bookingsButton: {
    marginRight: 10,
  },
  bookingsButtonText: {
    color: "#E50914",
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 5,
  },
  logoutButtonText: {
    color: "gray",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  moviesList: {
    padding: 10,
  },
  movieCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  poster: {
    width: 100,
    height: 150,
  },
  movieInfo: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  movieGenre: {
    color: "gray",
    fontSize: 14,
    marginBottom: 10,
  },
  movieMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  movieDuration: {
    color: "gray",
    fontSize: 14,
  },
  movieRating: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function AdminMoviesScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

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

    // Refresh movies when screen is focused
    const unsubscribe = navigation.addListener("focus", () => {
      fetchMovies();
    });

    return unsubscribe;
  }, [navigation]);

  // Mock movies if Firestore doesn't have data yet
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

  const handleDeleteMovie = (movieId, movieTitle) => {
    Alert.alert(
      "Delete Movie",
      `Are you sure you want to delete "${movieTitle}"?`,
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
              await deleteDoc(doc(db, "movies", movieId));
              setMovies((prevMovies) =>
                prevMovies.filter((movie) => movie.id !== movieId)
              );
              Alert.alert("Success", "Movie deleted successfully");
            } catch (error) {
              console.error("Error deleting movie: ", error);
              Alert.alert("Error", "Failed to delete movie");
            }
          },
        },
      ]
    );
  };

  const renderMovieItem = ({ item }) => (
    <View style={styles.movieCard}>
      <Image source={{ uri: item.poster }} style={styles.poster} />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{item.title}</Text>
        <Text style={styles.movieGenre}>{item.genre}</Text>
        <View style={styles.movieMeta}>
          <Text style={styles.movieDuration}>{item.duration}</Text>
          <Text style={styles.movieRating}>⭐ {item.rating}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("AdminMovieForm", { movie: item })}
        >
          <Ionicons name="create-outline" size={20} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteMovie(item.id, item.title)}
        >
          <Ionicons name="trash-outline" size={20} color="#E50914" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Movies</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AdminMovieForm")}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
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
    width: 80,
    height: 120,
  },
  movieInfo: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
  },
  movieTitle: {
    fontSize: 16,
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
  actions: {
    justifyContent: "center",
    padding: 10,
  },
  actionButton: {
    padding: 8,
  },
});

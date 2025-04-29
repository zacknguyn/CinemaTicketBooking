import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";

export default function MovieDetailScreen({ route, navigation }) {
  const { movie } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: movie.poster }} style={styles.poster} />

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{movie.title}</Text>

        <View style={styles.metaContainer}>
          <Text style={styles.genre}>{movie.genre}</Text>
          <Text style={styles.duration}>{movie.duration}</Text>
          <Text style={styles.rating}>⭐ {movie.rating}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.synopsis}>
            {movie.synopsis ||
              "A professional thief who steals information by infiltrating the subconscious of his targets is offered a chance to have his criminal history erased as payment for the implantation of another person's idea into a target's subconscious."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cast</Text>
          <Text style={styles.castText}>
            {movie.cast ||
              "Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page, Tom Hardy, Ken Watanabe"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Director</Text>
          <Text style={styles.directorText}>
            {movie.director || "Christopher Nolan"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Showtimes", { movie })}
        >
          <Text style={styles.buttonText}>Book Tickets</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  poster: {
    width: "100%",
    height: 300,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  metaContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  genre: {
    color: "gray",
    marginRight: 15,
  },
  duration: {
    color: "gray",
    marginRight: 15,
  },
  rating: {
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  synopsis: {
    lineHeight: 22,
    color: "#333",
  },
  castText: {
    color: "#333",
  },
  directorText: {
    color: "#333",
  },
  button: {
    backgroundColor: "#E50914",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

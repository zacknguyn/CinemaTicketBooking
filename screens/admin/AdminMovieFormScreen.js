import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminMovieFormScreen({ route, navigation }) {
  const { movie } = route.params || {};
  const isEditing = !!movie;

  const [title, setTitle] = useState(movie?.title || "");
  const [genre, setGenre] = useState(movie?.genre || "");
  const [duration, setDuration] = useState(movie?.duration || "");
  const [rating, setRating] = useState(
    movie?.rating ? movie.rating.toString() : ""
  );
  const [synopsis, setSynopsis] = useState(movie?.synopsis || "");
  const [cast, setCast] = useState(movie?.cast || "");
  const [director, setDirector] = useState(movie?.director || "");
  const [posterUrl, setPosterUrl] = useState(movie?.poster || "");
  const [posterImage, setPosterImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const db = getFirestore();
  const storage = getStorage();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera roll permissions to upload images"
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPosterImage(result.assets[0]);
      setPosterUrl(result.assets[0].uri);
    }
  };

  const uploadPoster = async () => {
    if (!posterImage) return posterUrl;

    try {
      const response = await fetch(posterImage.uri);
      const blob = await response.blob();

      const filename = `posters/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    } catch (error) {
      console.error("Error uploading image: ", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!title || !genre || !duration) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      let finalPosterUrl = posterUrl;

      // Upload new poster if selected
      if (posterImage) {
        finalPosterUrl = await uploadPoster();
      }

      const movieData = {
        title,
        genre,
        duration,
        rating: parseFloat(rating) || 0,
        synopsis,
        cast,
        director,
        poster: finalPosterUrl,
      };

      if (isEditing) {
        // Update existing movie
        await updateDoc(doc(db, "movies", movie.id), movieData);
        Alert.alert("Success", "Movie updated successfully");
      } else {
        // Add new movie
        await addDoc(collection(db, "movies"), movieData);
        Alert.alert("Success", "Movie added successfully");
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error saving movie: ", error);
      Alert.alert("Error", "Failed to save movie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.posterContainer}>
          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.posterPreview} />
          ) : (
            <View style={styles.posterPlaceholder}>
              <Text style={styles.posterPlaceholderText}>No Poster</Text>
            </View>
          )}
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.uploadButtonText}>
              {posterUrl ? "Change Poster" : "Upload Poster"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Movie title"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Genre *</Text>
          <TextInput
            style={styles.input}
            value={genre}
            onChangeText={setGenre}
            placeholder="e.g. Action, Drama, Comedy"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Duration *</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g. 120 min"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Rating</Text>
            <TextInput
              style={styles.input}
              value={rating}
              onChangeText={setRating}
              placeholder="e.g. 8.5"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Synopsis</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={synopsis}
            onChangeText={setSynopsis}
            placeholder="Movie synopsis"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cast</Text>
          <TextInput
            style={styles.input}
            value={cast}
            onChangeText={setCast}
            placeholder="e.g. Tom Hanks, Emma Stone"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Director</Text>
          <TextInput
            style={styles.input}
            value={director}
            onChangeText={setDirector}
            placeholder="e.g. Christopher Nolan"
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Saving..." : isEditing ? "Update Movie" : "Add Movie"}
          </Text>
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
  formContainer: {
    padding: 20,
  },
  posterContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  posterPreview: {
    width: 150,
    height: 225,
    borderRadius: 8,
    marginBottom: 10,
  },
  posterPlaceholder: {
    width: 150,
    height: 225,
    borderRadius: 8,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  posterPlaceholderText: {
    color: "#888",
  },
  uploadButton: {
    backgroundColor: "#555",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: "row",
  },
  saveButton: {
    backgroundColor: "#E50914",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

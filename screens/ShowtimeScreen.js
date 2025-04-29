import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function ShowtimeScreen({ route, navigation }) {
  const { movie } = route.params;
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Generate dates for the next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  // Mock showtimes
  const showtimes = [
    "10:00 AM",
    "12:30 PM",
    "3:00 PM",
    "5:30 PM",
    "8:00 PM",
    "10:30 PM",
  ];

  const formatDate = (date) => {
    const options = { weekday: "short", day: "numeric", month: "short" };
    return date.toLocaleDateString("en-US", options);
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      navigation.navigate("SeatSelection", {
        movie,
        showtime: {
          date: formatDate(selectedDate),
          time: selectedTime,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.datesContainer}
      >
        {dates.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateItem,
              selectedDate &&
                date.toDateString() === selectedDate.toDateString() &&
                styles.selectedItem,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text
              style={[
                styles.dateText,
                selectedDate &&
                  date.toDateString() === selectedDate.toDateString() &&
                  styles.selectedText,
              ]}
            >
              {formatDate(date)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.title}>Select Time</Text>
      <View style={styles.timesContainer}>
        {showtimes.map((time, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.timeItem,
              selectedTime === time && styles.selectedItem,
            ]}
            onPress={() => setSelectedTime(time)}
          >
            <Text
              style={[
                styles.timeText,
                selectedTime === time && styles.selectedText,
              ]}
            >
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <Text style={styles.movieTitle}>{movie.title}</Text>

        {selectedDate && selectedTime ? (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>
              Date: {formatDate(selectedDate)}
            </Text>
            <Text style={styles.detailText}>Time: {selectedTime}</Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>
            Please select date and time
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          !(selectedDate && selectedTime) && styles.disabledButton,
        ]}
        onPress={handleContinue}
        disabled={!(selectedDate && selectedTime)}
      >
        <Text style={styles.buttonText}>Continue to Seat Selection</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },
  datesContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  dateItem: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "white",
    marginRight: 10,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dateText: {
    fontSize: 14,
  },
  timesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 30,
  },
  timeItem: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "white",
    margin: 5,
    minWidth: 90,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  timeText: {
    fontSize: 14,
  },
  selectedItem: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },
  selectedText: {
    color: "white",
    fontWeight: "bold",
  },
  summaryContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  movieTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  detailsContainer: {
    marginTop: 5,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  placeholderText: {
    color: "gray",
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#E50914",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});

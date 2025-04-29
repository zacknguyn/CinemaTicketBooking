import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function SeatSelectionScreen({ route, navigation }) {
  const { movie, showtime } = route.params;
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Mock seat layout (8 rows x 10 seats)
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seatsPerRow = 10;

  // Mock unavailable seats
  const unavailableSeats = [
    "A3",
    "A4",
    "B5",
    "C7",
    "C8",
    "D1",
    "D2",
    "E10",
    "F4",
    "G7",
    "H1",
    "H2",
    "H3",
  ];

  const toggleSeat = (seatId) => {
    if (unavailableSeats.includes(seatId)) return;

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((seat) => seat !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const getSeatStatus = (seatId) => {
    if (unavailableSeats.includes(seatId)) return "unavailable";
    if (selectedSeats.includes(seatId)) return "selected";
    return "available";
  };

  const handleContinue = () => {
    if (selectedSeats.length > 0) {
      navigation.navigate("Checkout", {
        movie,
        showtime,
        seats: selectedSeats,
        totalPrice: selectedSeats.length * 12.99, // $12.99 per ticket
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        <View style={styles.screen} />
        <Text style={styles.screenText}>SCREEN</Text>
      </View>

      <ScrollView style={styles.seatsContainer}>
        {rows.map((row) => (
          <View key={row} style={styles.row}>
            <Text style={styles.rowLabel}>{row}</Text>
            <View style={styles.seats}>
              {Array.from({ length: seatsPerRow }, (_, i) => {
                const seatNumber = i + 1;
                const seatId = `${row}${seatNumber}`;
                const status = getSeatStatus(seatId);

                return (
                  <TouchableOpacity
                    key={seatId}
                    style={[
                      styles.seat,
                      status === "selected" && styles.selectedSeat,
                      status === "unavailable" && styles.unavailableSeat,
                    ]}
                    onPress={() => toggleSeat(seatId)}
                    disabled={status === "unavailable"}
                  >
                    <Text
                      style={[
                        styles.seatText,
                        status === "selected" && styles.selectedSeatText,
                      ]}
                    >
                      {seatNumber}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.availableLegendSeat]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.selectedSeat]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.unavailableSeat]} />
          <Text style={styles.legendText}>Unavailable</Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Movie:</Text>
          <Text style={styles.summaryValue}>{movie.title}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date & Time:</Text>
          <Text style={styles.summaryValue}>
            {showtime.date}, {showtime.time}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Selected Seats:</Text>
          <Text style={styles.summaryValue}>
            {selectedSeats.length > 0
              ? selectedSeats.sort().join(", ")
              : "None"}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Price:</Text>
          <Text style={styles.summaryValue}>
            ${(selectedSeats.length * 12.99).toFixed(2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          selectedSeats.length === 0 && styles.disabledButton,
        ]}
        onPress={handleContinue}
        disabled={selectedSeats.length === 0}
      >
        <Text style={styles.buttonText}>Continue to Checkout</Text>
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
  screenContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  screen: {
    height: 10,
    width: "80%",
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginBottom: 5,
  },
  screenText: {
    color: "gray",
    fontSize: 12,
  },
  seatsContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  rowLabel: {
    width: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  seats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  seat: {
    width: 25,
    height: 25,
    borderRadius: 5,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedSeat: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },
  unavailableSeat: {
    backgroundColor: "#ddd",
    borderColor: "#ccc",
  },
  seatText: {
    fontSize: 10,
  },
  selectedSeatText: {
    color: "white",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendSeat: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginRight: 5,
    borderWidth: 1,
  },
  availableLegendSeat: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
  },
  legendText: {
    fontSize: 12,
  },
  summaryContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryLabel: {
    fontWeight: "bold",
  },
  summaryValue: {
    maxWidth: "60%",
    textAlign: "right",
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

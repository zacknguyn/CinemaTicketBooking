import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function CheckoutScreen({ route, navigation }) {
  const { movie, showtime, seats, totalPrice } = route.params;
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  const handlePayment = async () => {
    // Basic validation
    if (paymentMethod === "card") {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        Alert.alert("Error", "Please fill in all payment details");
        return;
      }

      if (cardNumber.length < 16) {
        Alert.alert("Error", "Please enter a valid card number");
        return;
      }
    }

    setLoading(true);

    try {
      // Save booking to Firestore
      const bookingRef = await addDoc(collection(db, "bookings"), {
        userId: auth.currentUser.uid,
        movieId: movie.id,
        movieTitle: movie.title,
        date: showtime.date,
        time: showtime.time,
        seats: seats,
        totalPrice: totalPrice,
        paymentMethod: paymentMethod,
        createdAt: new Date(),
        status: "confirmed",
      });

      // Navigate to success screen or bookings screen
      Alert.alert(
        "Booking Confirmed",
        `Your booking has been confirmed. Booking ID: ${bookingRef.id
          .substring(0, 8)
          .toUpperCase()}`,
        [
          {
            text: "View My Bookings",
            onPress: () => navigation.navigate("Bookings"),
          },
        ]
      );
    } catch (error) {
      console.error("Error adding booking: ", error);
      Alert.alert(
        "Error",
        "There was an error processing your payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text) => {
    // Remove non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Limit to 16 digits
    const trimmed = cleaned.substring(0, 16);
    // Add spaces after every 4 digits
    const formatted = trimmed.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted;
  };

  const formatExpiryDate = (text) => {
    // Remove non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Limit to 4 digits
    const trimmed = cleaned.substring(0, 4);
    // Add slash after first 2 digits
    if (trimmed.length > 2) {
      return `${trimmed.substring(0, 2)}/${trimmed.substring(2)}`;
    }
    return trimmed;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Booking Summary</Text>

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
          <Text style={styles.summaryLabel}>Seats:</Text>
          <Text style={styles.summaryValue}>{seats.sort().join(", ")}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tickets:</Text>
          <Text style={styles.summaryValue}>{seats.length} x $12.99</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.paymentContainer}>
        <Text style={styles.sectionTitle}>Payment Method</Text>

        <View style={styles.paymentOptions}>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "card" && styles.selectedPaymentOption,
            ]}
            onPress={() => setPaymentMethod("card")}
          >
            <Text
              style={[
                styles.paymentOptionText,
                paymentMethod === "card" && styles.selectedPaymentOptionText,
              ]}
            >
              Credit Card
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "paypal" && styles.selectedPaymentOption,
            ]}
            onPress={() => setPaymentMethod("paypal")}
          >
            <Text
              style={[
                styles.paymentOptionText,
                paymentMethod === "paypal" && styles.selectedPaymentOptionText,
              ]}
            >
              PayPal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "applepay" && styles.selectedPaymentOption,
            ]}
            onPress={() => setPaymentMethod("applepay")}
          >
            <Text
              style={[
                styles.paymentOptionText,
                paymentMethod === "applepay" &&
                  styles.selectedPaymentOptionText,
              ]}
            >
              Apple Pay
            </Text>
          </TouchableOpacity>
        </View>

        {paymentMethod === "card" && (
          <View style={styles.cardDetails}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="numeric"
                maxLength={19} // 16 digits + 3 spaces
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={cardName}
                onChangeText={setCardName}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="numeric"
                  maxLength={5} // MM/YY
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        )}

        {paymentMethod === "paypal" && (
          <View style={styles.alternativePayment}>
            <Text style={styles.alternativePaymentText}>
              You will be redirected to PayPal to complete your payment.
            </Text>
          </View>
        )}

        {paymentMethod === "applepay" && (
          <View style={styles.alternativePayment}>
            <Text style={styles.alternativePaymentText}>
              You will be prompted to confirm payment with Apple Pay.
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handlePayment}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Processing..." : "Complete Payment"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        By completing this payment, you agree to our Terms of Service and
        Privacy Policy.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  summaryContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    color: "#666",
  },
  summaryValue: {
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },
  totalValue: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#E50914",
  },
  paymentContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  paymentOptions: {
    flexDirection: "row",
    marginBottom: 20,
  },
  paymentOption: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  selectedPaymentOption: {
    borderColor: "#E50914",
    backgroundColor: "rgba(229, 9, 20, 0.05)",
  },
  paymentOptionText: {
    fontSize: 14,
  },
  selectedPaymentOptionText: {
    color: "#E50914",
    fontWeight: "bold",
  },
  cardDetails: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
  },
  alternativePayment: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    borderStyle: "dashed",
  },
  alternativePaymentText: {
    textAlign: "center",
    color: "#666",
  },
  button: {
    backgroundColor: "#E50914",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disclaimer: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginBottom: 30,
  },
});

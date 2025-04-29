import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { onAuthStateChanged } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "./firebase";

// Import user screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import MovieDetailScreen from "./screens/MovieDetailScreen";
import ShowtimeScreen from "./screens/ShowtimeScreen";
import SeatSelectionScreen from "./screens/SeatSelectionScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import BookingsScreen from "./screens/BookingsScreen";

// Import admin screens
import AdminDashboardScreen from "./screens/admin/AdminDashboardScreen";
import AdminMoviesScreen from "./screens/admin/AdminMoviesScreen";
import AdminShowtimesScreen from "./screens/admin/AdminShowtimesScreen";
import AdminBookingsScreen from "./screens/admin/AdminBookingsScreen";
import AdminUsersScreen from "./screens/admin/AdminUsersScreen";
import AdminMovieFormScreen from "./screens/admin/AdminMovieFormScreen";

// Initialize global admin state
global.isAdminUser = false;

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// User Tab Navigator
function UserTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Movies") {
            iconName = focused ? "film" : "film-outline";
          } else if (route.name === "MyBookings") {
            iconName = focused ? "ticket" : "ticket-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#E50914",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Movies"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="MyBookings"
        component={BookingsScreen}
        options={{
          headerShown: false,
          title: "My Bookings",
        }}
      />
    </Tab.Navigator>
  );
}

// Admin Tab Navigator
function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Movies") {
            iconName = focused ? "film" : "film-outline";
          } else if (route.name === "Showtimes") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Bookings") {
            iconName = focused ? "ticket" : "ticket-outline";
          } else if (route.name === "Users") {
            iconName = focused ? "people" : "people-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#E50914",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Movies"
        component={AdminMoviesScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Showtimes"
        component={AdminShowtimesScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Bookings"
        component={AdminBookingsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Users"
        component={AdminUsersScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = React.useState(null);
  const [initializing, setInitializing] = React.useState(true);

  // Handle user state changes
  function onAuthStateChangedHandler(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  React.useEffect(() => {
    const subscriber = onAuthStateChanged(auth, onAuthStateChangedHandler);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          // Auth screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : global.isAdminUser ? (
          // Admin screens
          <>
            <Stack.Screen
              name="AdminTabs"
              component={AdminTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AdminMovieForm"
              component={AdminMovieFormScreen}
              options={({ route }) => ({
                title: route.params?.movie ? "Edit Movie" : "Add Movie",
              })}
            />
          </>
        ) : (
          // User screens
          <>
            <Stack.Screen
              name="UserTabs"
              component={UserTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MovieDetail"
              component={MovieDetailScreen}
              options={{ title: "Movie Details" }}
            />
            <Stack.Screen
              name="Showtimes"
              component={ShowtimeScreen}
              options={{ title: "Select Showtime" }}
            />
            <Stack.Screen
              name="SeatSelection"
              component={SeatSelectionScreen}
              options={{ title: "Select Seats" }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ title: "Checkout" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

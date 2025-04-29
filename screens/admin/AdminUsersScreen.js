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
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Mock data if Firestore doesn't have data yet
  const mockUsers = [
    {
      id: "user1",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
    {
      id: "user2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "user",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
    {
      id: "admin1",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    },
  ];

  const displayUsers = users.length > 0 ? users : mockUsers;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleAddUser = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      // Add user data to Firestore
      await setDoc(doc(db, "users", userId), {
        name,
        email,
        role: isAdmin ? "admin" : "user",
        createdAt: new Date(),
      });

      // Update local state
      setUsers([
        ...users,
        {
          id: userId,
          name,
          email,
          role: isAdmin ? "admin" : "user",
          createdAt: new Date(),
        },
      ]);

      // Reset form and close modal
      setModalVisible(false);
      setName("");
      setEmail("");
      setPassword("");
      setIsAdmin(false);

      Alert.alert("Success", "User added successfully");
    } catch (error) {
      console.error("Error adding user: ", error);
      Alert.alert("Error", error.message);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";

    Alert.alert("Change Role", `Change user role to ${newRole}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Change",
        onPress: async () => {
          try {
            await updateDoc(doc(db, "users", userId), {
              role: newRole,
            });

            // Update local state
            setUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.id === userId ? { ...user, role: newRole } : user
              )
            );

            Alert.alert("Success", "User role updated");
          } catch (error) {
            console.error("Error updating user: ", error);
            Alert.alert("Error", "Failed to update user role");
          }
        },
      },
    ]);
  };

  const handleDeleteUser = (userId, userName) => {
    Alert.alert("Delete User", `Are you sure you want to delete ${userName}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "users", userId));
            setUsers((prevUsers) =>
              prevUsers.filter((user) => user.id !== userId)
            );
            Alert.alert("Success", "User deleted successfully");
          } catch (error) {
            console.error("Error deleting user: ", error);
            Alert.alert("Error", "Failed to delete user");
          }
        },
      },
    ]);
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.userMeta}>
          <View
            style={[
              styles.roleBadge,
              item.role === "admin" ? styles.adminBadge : styles.userBadge,
            ]}
          >
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
          <Text style={styles.dateText}>
            Joined: {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleRole(item.id, item.role)}
        >
          <Ionicons
            name={item.role === "admin" ? "person-outline" : "shield-outline"}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteUser(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={20} color="#E50914" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.usersList}
      />

      {/* Add User Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New User</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password (min. 6 characters)"
                secureTextEntry
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, isAdmin && styles.checkboxChecked]}
                  onPress={() => setIsAdmin(!isAdmin)}
                >
                  {isAdmin && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Admin User</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addUserButton}
              onPress={handleAddUser}
            >
              <Text style={styles.addUserButtonText}>Add User</Text>
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
  usersList: {
    padding: 15,
  },
  userCard: {
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 10,
  },
  adminBadge: {
    backgroundColor: "#e6f7ed",
  },
  userBadge: {
    backgroundColor: "#f0f0f0",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  dateText: {
    fontSize: 12,
    color: "#888",
  },
  actions: {
    justifyContent: "center",
  },
  actionButton: {
    padding: 8,
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },
  checkboxLabel: {
    fontSize: 16,
  },
  addUserButton: {
    backgroundColor: "#E50914",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  addUserButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

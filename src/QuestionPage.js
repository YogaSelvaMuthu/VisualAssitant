// QuestionPage.js

import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";

const QuestionPage = ({ handleBackToWelcome }) => {
  const [inputText, setInputText] = useState(""); // State to store user input
  const [loading, setLoading] = useState(false); // State to manage loading state during detection

  const handleInputSubmit = async () => {
    if (!inputText.trim()) {
      Alert.alert("Error", "Please enter an object name.");
      return;
    }

    // Start loading state
    setLoading(true);

    // Simulate object detection delay (replace with actual object detection logic)
    setTimeout(() => {
      setLoading(false);

      // Show result based on detection (replace with actual detection result logic)
      const detected = detectObject(inputText);
      if (detected) {
        Alert.alert("Object Detected", `Object '${inputText}' is present.`);
      } else {
        Alert.alert("Object Not Detected", `Object '${inputText}' is not present.`);
      }

      // Clear input after detection
      setInputText("");
    }, 2000); // Simulated detection delay of 2 seconds
  };

  // Dummy object detection function (replace with actual detection logic)
  const detectObject = (objectName) => {
    const objectsList = ["chair", "table", "book", "pen", "laptop", "person","cellphone","bottle"]; // Example list of objects
    return objectsList.includes(objectName.toLowerCase());
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>What would you like to search?</Text>
      <TextInput
        style={{ height: 50, width: 300, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, borderRadius: 20 }}
        onChangeText={setInputText}
        value={inputText}
        placeholder="Type here..."
      />
      <TouchableOpacity onPress={handleInputSubmit} style={{ padding: 18, backgroundColor: "black", borderRadius: 30, marginTop: 10 }}>
        <Text style={{ fontSize: 34, color: "white", textAlign: "center", fontWeight: "bold" }}>{loading ? "Detecting..." : "Enter"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleBackToWelcome} style={{ padding: 18, backgroundColor: "black", borderRadius: 30, marginTop: 10 }}>
        <Text style={{ fontSize: 34, color: "white", textAlign: "center", fontWeight: "bold" }}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default QuestionPage;

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { speak } from 'expo-speech';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [faces, setFaces] = useState([]);
  const [faceCount, setFaceCount] = useState(0);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const cameraRef = useRef(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [showFacePage, setShowFacePage] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    // Trigger voice output after 2 seconds when face count changes
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    setDebounceTimer(setTimeout(() => {
      speak(`${faceCount}faces detected:`,{ rate: 1.1 });
    }, 1000));

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [faceCount]);

  const handleFacesDetected = ({ faces }) => {
    setFaces(faces);
    setFaceCount(faces.length);
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.front
        ? Camera.Constants.Type.back
        : Camera.Constants.Type.front
    );
  };
  const handleBackToWelcome = () => {
    setShowFacePage(false);
    setShowWelcome(true);
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={cameraRef}
        type={cameraType}
        style={styles.camera}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
      <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
        <Text style={styles.buttonText}>Toggle Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={handleBackToWelcome}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.faceCount}>{faces.length} faces detected</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  button: {
    color: 'white',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 150,
    borderRadius: 20,
    opacity:0,
  },
  buttonText: {
    color: 'white',
    fontSize:20,
    opacity:0,
  },
  backButtonText: {
    color: 'white',
    fontSize: 25,
    position: 'absolute',
    top: -650,
    left: 10,
    padding: 20,
    backgroundColor:'black',
    borderRadius:50,

  },
  faceCount: {
    color: 'white',
    alignSelf: 'center',
    marginVertical: 20,
    fontSize: 18,
  },
});

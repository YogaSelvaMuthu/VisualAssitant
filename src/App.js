import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, ImageBackground, PanResponder } from "react-native";
import { Camera } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from 'expo-av';
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { modelURI } from "./modelHandler";
import CameraView from "./CameraView";
import QuestionPage from "./QuestionPage";
import FacePage from "./FacePage"; // Update the import statement

const WelcomePage = ({ onObjectDetectionPress, onFaceDetectionPress, onWhatIsInFrontOfMePress }) => {
  return (
    <ImageBackground source={require('../bggg.jpg')} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 52, marginBottom: 20, fontWeight: '900', marginTop: -40, color: 'white', marginBottom:300 }}>Visual Assistance System</Text>
        <TouchableOpacity onPress={onObjectDetectionPress} style={{ padding: 15, backgroundColor: "#FFFFFF",marginTop:-150, borderRadius: 40, shadowColor: "gray", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 15, marginBottom: 20, opacity: 0.8 }}>
          <Text style={{ fontSize: 25, color: "black", textAlign: "center", fontWeight: "bold" }}>Object Detection</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onFaceDetectionPress} style={{ padding: 20, backgroundColor: "#FFFFFF", borderRadius: 40, shadowColor: "gray",margintop:100, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5, marginBottom: 20, opacity:0.8 }}>
          <Text style={{fontSize: 25, color: "black", textAlign: "center", fontWeight: "bold" }}>Face Detection</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onWhatIsInFrontOfMePress} style={{ padding: 20, backgroundColor: "#FFFFFF", borderRadius: 40, shadowColor: "gray",margintop:120, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5, marginBottom: 10, opacity:0.8 }}>
          <Text style={{fontSize: 25, color: "black", textAlign: "center", fontWeight: "bold" }}>What is Infront of me?</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const App = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState("back");
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState({ loading: true, progress: 0 });
  const [inputTensor, setInputTensor] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomePlayed, setWelcomePlayed] = useState(false);
  const [soundObject, setSoundObject] = useState(null);
  const [showQuestionPage, setShowQuestionPage] = useState(false);
  const [showFacePage, setShowFacePage] = useState(false); // Update the state variable name

  const configurations = { threshold: 0.25 };
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (e, gestureState) => {
        const { dx, dy } = gestureState;
        if (dx < -50) {
          handleStartObjectDetection();
        } else if (dx > 50) {
          handleStartFaceDetection();
        } else if (dy < -50) {
          handleStartWhatIsInFrontOfMe();
        } else if (dy > 50) {
          //setShowWelcome(true);
          console.log("home");
          handleBackToWelcome();
        }
      },
    })
  ).current;
    const handleInputChange = (text) => {
      console.log("Typed text:", text);
      
      // Update state with the input text
      setInputText(text);
    
      // Perform validation if needed
      if (text.length < 5) {
        console.log("Input text is too short.");
      } else {
        console.log("Input text is valid.");
      }
    
      // Any additional logic related to handling input change
    };
    
    useEffect(() => {
      const initializeModel = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
        await tf.ready(); 
        const yolov5 = await tf.loadGraphModel(modelURI, {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions });
          },
        });

        const dummyInput = tf.ones(yolov5.inputs[0].shape);
        await yolov5.executeAsync(dummyInput);
        tf.dispose(dummyInput);

        setInputTensor(yolov5.inputs[0].shape);
        setModel(yolov5);
        setLoading({ loading: false, progress: 1 });
      };

      initializeModel();
    }, []);

    useEffect(() => {
      const playWelcomeAudio = async () => {
        if (showWelcome && !welcomePlayed) {
          const soundObjectInstance = new Audio.Sound();
          setSoundObject(soundObjectInstance);
          try {
            await soundObjectInstance.loadAsync(require('../Welcome.mp3'));
            await soundObjectInstance.playAsync();
            setWelcomePlayed(true);
          } catch (error) {
            console.error('Failed to load the sound', error);
          }
        }
      };

      playWelcomeAudio();

      return () => {
        if (soundObject) {
          soundObject.unloadAsync();
        }
      };
    }, [showWelcome, welcomePlayed]);

    const handleStartObjectDetection = async () => {
      setShowWelcome(false);
      const objectDetectionSound = new Audio.Sound();
      try {
        await objectDetectionSound.loadAsync(require('../ObjectDetection.mp3'));
        await objectDetectionSound.playAsync();
      } catch (error) {
        console.error('Failed to load the sound', error);
      }
    };

    const handleStartFaceDetection = async () => {
      setShowWelcome(false);
      setShowFacePage(true); // Update the state variable name
      const faceDetectionSound = new Audio.Sound();
      try {
        await faceDetectionSound.loadAsync(require('../FaceDetection.mp3'));
        await faceDetectionSound.playAsync();
      } catch (error) {
        console.error('Failed to load the sound', error);
      }
      console.log("Starting face detection...");
    };
  
    const handleStartWhatIsInFrontOfMe = async () => {
      setShowWelcome(false);
      setShowQuestionPage(true);
      const faceDetectionSound = new Audio.Sound();
      try {
        await faceDetectionSound.loadAsync(require('../what-search.mp3'));
        await faceDetectionSound.playAsync();
      } catch (error) {
        console.error('Failed to load the sound', error);
      }
      console.log("Starting What is In-Front of me...");
    };

    const handleBackToWelcome = async () => {
      if (soundObject) {
        soundObject.unloadAsync();
      }
      const backSoundObject = new Audio.Sound();
      setSoundObject(backSoundObject);
      try {
        await backSoundObject.loadAsync(require('../back.mp3'));
        await backSoundObject.playAsync();
      } catch (error) {
        console.error('Failed to load the sound', error);
      }
      setShowWelcome(true);
      setShowQuestionPage(false); // Hide the question page when navigating back
    };

    return (
      <View style={{ flex: 1, backgroundColor: "black" }} {...panResponder.panHandlers}>
        {showWelcome ? (
          <WelcomePage 
            onObjectDetectionPress={handleStartObjectDetection} 
            onFaceDetectionPress={handleStartFaceDetection}
            onWhatIsInFrontOfMePress={handleStartWhatIsInFrontOfMe}
          />
        ) : showQuestionPage ? (
          <QuestionPage
            handleInputChange={handleInputChange}
            handleStartObjectDetection={handleStartObjectDetection} // Pass handleStartObjectDetection as a prop
            handleBackToWelcome={handleBackToWelcome}
          />
        ) : showFacePage ?(
          <FacePage/>
        ):(
          <>
            {hasPermission ? (
              <>
                {loading.loading ? (
                  <Text style={{ fontSize: 18, textAlign: "center", marginTop: 20 }}>Loading... {(loading.progress * 100).toFixed(2)}%</Text>
                ) : (
                  <View style={{ flex: 1 }}>
                    <CameraView
                      type={type}
                      model={model}
                      inputTensorSize={inputTensor}
                      config={configurations}
                    >
                      <View style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", justifyContent: "flex-end", alignItems: "center", backgroundColor: "transparent", zIndex: 20 }}>
                        <TouchableOpacity
                          style={{ flexDirection: "row", alignItems: "center", backgroundColor: "transparent", borderWidth: 2, borderColor: "white", padding: 10, marginBottom: 10, borderRadius: 10 }}
                          onPress={() => setType(current => (current === "back" ? "front" : "back"))}
                        >
                          <MaterialCommunityIcons name="camera-flip" size={30} color="white" style={{ marginRight: 10 }} />
                          <Text style={{ fontSize: 18, color: "white", fontWeight: "bold" }}>Flip Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ position: "absolute", top: 50, left: 20 }}
                          onPress={handleBackToWelcome}
                        >
                         <MaterialCommunityIcons name="arrow-left" size={50} color="white" />
                        </TouchableOpacity>
                      </View>
                    </CameraView>
                  </View>
                )}
              </>
            ) : (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 18 }}>Permission not granted!</Text>
              </View>
            )}
          </>
        )}
        <StatusBar style="auto" />
      </View>
    );
  };
  
  export default App;
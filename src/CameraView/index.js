import { useState, useEffect, useRef } from "react";
import { View } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { GLView } from "expo-gl";
import Expo2DContext from "expo-2d-context";
import * as tf from "@tensorflow/tfjs";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import { preprocess } from "../utils/preprocess";
import { renderBoxes } from "../utils/renderBox";
import labels from "../utils/labels"; // Import class labels
import { Audio } from 'expo-av'; // Import Audio from expo-av

const TensorCamera = cameraWithTensors(Camera);

const audioPaths = {
  person: require('../../audio/person.mp3'),
  bicycle: require('../../audio/bicycle.mp3'),
  car: require('../../audio/car.mp3'),
  motorcycle: require('../../audio/motorcycle.mp3'),
  airplane: require('../../audio/airplane.mp3'),
  bus: require('../../audio/bus.mp3'),
  train: require('../../audio/train.mp3'),
  truck: require('../../audio/truck.mp3'),
  boat: require('../../audio/boat.mp3'),
  "traffic light": require('../../audio/traffic light.mp3'),
  "fire hydrant": require('../../audio/fire hydrant.mp3'),
  stopsign: require('../../audio/stopsign.mp3'),
  "parking meter": require('../../audio/parking meter.mp3'),
  bench: require('../../audio/bench.mp3'),
  bird: require('../../audio/bird.mp3'),
  cat: require('../../audio/cat.mp3'),
  dog: require('../../audio/dog.mp3'),
  horse: require('../../audio/horse.mp3'),
  sheep: require('../../audio/sheep.mp3'),
  cow: require('../../audio/cow.mp3'),
  elephant: require('../../audio/elephant.mp3'),
  bear: require('../../audio/bear.mp3'),
  zebra: require('../../audio/zebra.mp3'),
  giraffe: require('../../audio/giraffe.mp3'),
  backpack: require('../../audio/backpack.mp3'),
  umbrella: require('../../audio/umbrella.mp3'),
  handbag: require('../../audio/handbag.mp3'),
  tie: require('../../audio/tie.mp3'),
  suitcase: require('../../audio/suitcase.mp3'),
  fan: require('../../audio/fan.mp3'),
  skis: require('../../audio/skis.mp3'),
  snowboard: require('../../audio/snowboard.mp3'),
  "sports ball": require('../../audio/sports ball.mp3'),
  kite: require('../../audio/kite.mp3'),
  "baseball bat": require('../../audio/baseball bat.mp3'),
  "baseball glove": require('../../audio/baseball glove.mp3'),
  skateboard: require('../../audio/skateboard.mp3'),
  surfboard: require('../../audio/surfboard.mp3'),
  "tennis racket": require('../../audio/tennis racket.mp3'),
  bottle: require('../../audio/bottle.mp3'),
  wineglass: require('../../audio/wineglass.mp3'),
  cup: require('../../audio/cup.mp3'),
  fork: require('../../audio/fork.mp3'),
  knife: require('../../audio/knife.mp3'),
  spoon: require('../../audio/spoon.mp3'),
  bowl: require('../../audio/bowl.mp3'),
  banana: require('../../audio/banana.mp3'),
  apple: require('../../audio/apple.mp3'),
  sandwich: require('../../audio/sandwich.mp3'),
  orange: require('../../audio/orange.mp3'),
  broccoli: require('../../audio/broccoli.mp3'),
  carrot: require('../../audio/carrot.mp3'),
  "hot dog": require('../../audio/hot dog.mp3'),
  pizza: require('../../audio/pizza.mp3'),
  donut: require('../../audio/donut.mp3'),
  cake: require('../../audio/cake.mp3'),
  chair: require('../../audio/chair.mp3'),
  couch: require('../../audio/couch.mp3'),
  "potted plant": require('../../audio/potted plant.mp3'),
  bed: require('../../audio/bed.mp3'),
  diningtable: require('../../audio/diningtable.mp3'),
  toilet: require('../../audio/toilet.mp3'),
  tv: require('../../audio/tv.mp3'),
  laptop: require('../../audio/laptop.mp3'),
  mouse: require('../../audio/mouse.mp3'),
  remote: require('../../audio/remote.mp3'),
  keyboard: require('../../audio/keyboard.mp3'),
  cellphone: require('../../audio/cellphone.mp3'),
  microwave: require('../../audio/microwave.mp3'),
  oven: require('../../audio/oven.mp3'),
  toaster: require('../../audio/toaster.mp3'),
  sink: require('../../audio/sink.mp3'),
  refrigerator: require('../../audio/refrigerator.mp3'),
  book: require('../../audio/book.mp3'),
  clock: require('../../audio/clock.mp3'),
  vase: require('../../audio/vase.mp3'),
  scissors: require('../../audio/scissors.mp3'),
  "teddy bear": require('../../audio/teddy bear.mp3'),
  "hair drier": require('../../audio/hair drier.mp3'),
  toothbrush: require('../../audio/toothbrush.mp3'),
};

const CameraView = ({ type, model, inputTensorSize, config, children }) => {
  const [ctx, setCTX] = useState(null);
  const typesMapper = { back: CameraType.back, front: CameraType.front };
  const audioRefs = useRef({});
  const [lastDetectionTime, setLastDetectionTime] = useState(0);
  const [detectedObjects, setDetectedObjects] = useState(new Set());

  useEffect(() => {
    // Clean up audio refs when component unmounts
    return () => {
      Object.values(audioRefs.current).forEach(audioRef => {
        audioRef.unloadAsync();
      });
    };
  }, []);

  const cameraStream = (images) => {
    const detectFrame = async () => {
      tf.engine().startScope();
      const [input, xRatio, yRatio] = preprocess(
        images.next().value,
        inputTensorSize[2],
        inputTensorSize[1]
      );

      await model.executeAsync(input).then(async (res) => {
        const [boxes, scores, classes] = res.slice(0, 3);
        const boxes_data = boxes.dataSync();
        const scores_data = scores.dataSync();
        const classes_data = Array.from(classes.dataSync()); // Convert typed array to regular array

        const currentTime = Date.now();

        // Process detected objects
        classes_data.forEach(async (classIndex, i) => {
          const score = scores_data[i];
          if (score > config.threshold) {
            const className = labels[classIndex]; // Get class name from labels array
            if (currentTime - lastDetectionTime > 100 && !audioRefs.current[className] && !detectedObjects.has(className)) {
              console.log(`Detected object: ${className}`);
              setDetectedObjects(new Set(detectedObjects.add(className))); // Add the detected object name to the set
              try {
                const audioPath = audioPaths[className];
                if (audioPath) {
                  const objectSound = new Audio.Sound();
                  await objectSound.loadAsync(audioPath);
                  await objectSound.playAsync();
                  audioRefs.current[className] = objectSound;
                  setLastDetectionTime(currentTime);
                }
              } catch (error) {
                console.error('Failed to load or play audio', error);
              }
            }
          }
        });

        // Render the boxes
        renderBoxes(ctx, config.threshold, boxes_data, scores_data, classes_data, [xRatio, yRatio]);
        tf.dispose([res, input]);
      });

      requestAnimationFrame(detectFrame); // get another frame
      tf.engine().endScope();
    };

    detectFrame();
  };

  return (
    <>
      {ctx && (
        <TensorCamera
          // Standard Camera props
          className="w-full h-full z-0"
          type={typesMapper[type]}
          // Tensor related props
          //use_custom_shaders_to_resize={true}
          resizeHeight={inputTensorSize[1]}
          resizeWidth={inputTensorSize[2]}
          resizeDepth={inputTensorSize[3]}
          onReady={cameraStream}
          autorender={true}
        />
      )}
      <View className="absolute left-0 top-0 w-full h-full flex items-center bg-transparent z-10">
        <GLView
          className="w-full h-full "
          onContextCreate={async (gl) => {
            const ctx2d = new Expo2DContext(gl);
            await ctx2d.initializeText();
            setCTX(ctx2d);
          }}
        />
      </View>
      {children}
    </>
  );
};

export default CameraView;

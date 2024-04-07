export default {
    name: "Blind Vision",
    slug: "your-app-slug",
    version: "1.0.0",
    platforms: [
      "ios",
      "android"
    ],
    android: {
      permissions: ["RECORD_AUDIO"] // Add the necessary permission for speech recognition
    }
  };
  
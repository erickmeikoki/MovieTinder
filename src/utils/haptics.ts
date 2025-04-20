export const hapticFeedback = {
  light: () => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch (error) {
        console.warn("Haptic feedback failed:", error);
      }
    }
  },

  medium: () => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(20);
      } catch (error) {
        console.warn("Haptic feedback failed:", error);
      }
    }
  },

  heavy: () => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([40, 30, 40]);
      } catch (error) {
        console.warn("Haptic feedback failed:", error);
      }
    }
  },

  success: () => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([10, 50, 10]);
      } catch (error) {
        console.warn("Haptic feedback failed:", error);
      }
    }
  },

  error: () => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([50, 30, 50, 30]);
      } catch (error) {
        console.warn("Haptic feedback failed:", error);
      }
    }
  },
};

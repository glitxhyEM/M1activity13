import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';

export default function App() {
  const [shakeCount, setShakeCount] = useState(0);
  const [shakeMessage, setShakeMessage] = useState('');
  const bgColorAnim = useRef(new Animated.Value(0)).current;
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    // Subscribe to accelerometer updates
    const accelerometerSubscription = Accelerometer.addListener(data => {
      setAccelerometerData(data);

      // Detect shake intensities
      const gentleThreshold = 1.0;
      const vigorousThreshold = 2.5;
      const maxAxis = Math.max(Math.abs(data.x), Math.abs(data.y), Math.abs(data.z));

      if (maxAxis > vigorousThreshold) {
        setShakeCount(prev => prev + 1);
        setShakeMessage('Shaking Vigorously!');
      } else if (maxAxis > gentleThreshold) {
        setShakeCount(prev => prev + 1);
        setShakeMessage('Shaking!');
      } else {
        setShakeMessage('');
      }
    });

    // Subscribe to gyroscope updates
    const gyroscopeSubscription = Gyroscope.addListener(data => {
      setGyroscopeData(data);

      let targetIndex = 0; // Default

      // Prioritize X-axis (Roll), then Y-axis (Pitch)
      if (Math.abs(data.x) > 0.3) {
        targetIndex = data.x > 0 ? 1 : 2;
      } else if (Math.abs(data.y) > 0.3) {
        targetIndex = data.y > 0 ? 3 : 4;
      }

      Animated.timing(bgColorAnim, {
        toValue: targetIndex,
        duration: 300,
        useNativeDriver: false, // background color doesn't support native driver
      }).start();
    });

    // Set update intervals
    Accelerometer.setUpdateInterval(100); // 10 times per second
    Gyroscope.setUpdateInterval(100);

    // Cleanup subscriptions
    return () => {
      accelerometerSubscription && accelerometerSubscription.remove();
      gyroscopeSubscription && gyroscopeSubscription.remove();
    };
  }, []);

  const backgroundColor = bgColorAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: ['#1f2937', '#ef4444', '#3b82f6', '#eab308', '#22c55e']
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.title}>Motion Fun</Text>
      <Text style={styles.subtitle}>Shake or tilt your device!</Text>

      <View style={styles.dataContainer}>
        <Text style={styles.sectionTitle}>Shake Counter</Text>
        <Text style={styles.counterText}>{shakeCount}</Text>
        {shakeMessage !== '' && (
          <Text style={styles.shakeMessageText}>{shakeMessage}</Text>
        )}
        <TouchableOpacity style={styles.resetButton} onPress={() => setShakeCount(0)}>
          <Text style={styles.resetButtonText}>Reset Count</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dataContainer}>
        <Text style={styles.sectionTitle}>Accelerometer</Text>
        <Text style={styles.dataText}>X: {accelerometerData.x.toFixed(2)}</Text>
        <Text style={styles.dataText}>Y: {accelerometerData.y.toFixed(2)}</Text>
        <Text style={styles.dataText}>Z: {accelerometerData.z.toFixed(2)}</Text>
      </View>

      <View style={styles.dataContainer}>
        <Text style={styles.sectionTitle}>Gyroscope</Text>
        <Text style={styles.dataText}>X: {gyroscopeData.x.toFixed(2)}</Text>
        <Text style={styles.dataText}>Y: {gyroscopeData.y.toFixed(2)}</Text>
        <Text style={styles.dataText}>Z: {gyroscopeData.z.toFixed(2)}</Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>Shake to increment counter</Text>
        <Text style={styles.instructionText}>Tilt to change background color</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#d1d5db',
    marginBottom: 40,
    textAlign: 'center',
  },
  dataContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    maxWidth: 350,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  counterText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
  },
  dataText: {
    fontSize: 16,
    color: '#e5e7eb',
    marginVertical: 4,
    fontFamily: 'monospace',
  },
  shakeMessageText: {
    fontSize: 18,
    color: '#f59e0b',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  resetButton: {
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructions: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginVertical: 4,
  },
});

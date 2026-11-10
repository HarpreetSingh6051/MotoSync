import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Redirect } from 'expo-router'
import SplashScreen from './splash'
import { Colors } from '@/theme/tokens'

// Session flag to prevent repeated splash during the same active session
let sessionSplashDone = false

export function setSessionSplashDone(done: boolean) {
  sessionSplashDone = done
}

export default function EntryScreen() {
  const [showSplash, setShowSplash] = useState(!sessionSplashDone)

  useEffect(() => {
    if (!sessionSplashDone) {
      const checkStatus = async () => {
        const onboardingSeen = await AsyncStorage.getItem('motosync_onboarding_seen')
        if (onboardingSeen) {
          sessionSplashDone = true
        }
      }
      checkStatus()
    }
  }, [])

  if (showSplash && !sessionSplashDone) {
    return <SplashScreen />
  }

  // Once splash / onboarding is completed, direct to 4 core tabs
  return <Redirect href={'/home' as any} />
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
})

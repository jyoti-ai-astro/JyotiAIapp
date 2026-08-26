const publicEnv = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },

  razorpay: {
    publicKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  },

  sentry: {
    publicDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },

  analytics: {
    mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  },

  app: {
    env: process.env.NEXT_PUBLIC_APP_ENV,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    publicBetaMode: process.env.NEXT_PUBLIC_BETA_MODE === 'true',
    disablePayments: process.env.NEXT_PUBLIC_DISABLE_PAYMENTS === 'true',
  },
}

export { publicEnv }
export default publicEnv

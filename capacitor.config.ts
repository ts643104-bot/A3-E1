import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.a3e1.misenglish',
  appName: 'A3&E1',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_a3e1',
      iconColor: '#b7df6d',
    },
  },
}

export default config
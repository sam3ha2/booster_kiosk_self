import Store from 'electron-store'

const IS_DEV = process.env.NODE_ENV === 'development'

export interface ConfigStoreValues {
  general: {
    autoLaunch: boolean
    developerMode: boolean
    zoom: number
    restoreWindowPosition: boolean
    language: string | null
  }
  settings: SettingStoreValues
}

export interface SettingStoreValues {
  mode: BayMode | null
  bayName: string | null
  gpass: {
    siteOid: string | null
    siteName: string | null
    boothId: string | null
    boothName: string | null
  } | null
}

export type BayMode = 'GPASS' | 'LOCAL'

export const configStore = new Store<ConfigStoreValues>({
  name: 'config',
  accessPropertiesByDotNotation: true,
  defaults: {
    general: {
      autoLaunch: false,
      developerMode: IS_DEV,
      zoom: 1.0,
      restoreWindowPosition: true,
      language: null,
    },
    settings: {
      mode: null,
      bayName: null,
      gpass: {
        siteOid: null,
        siteName: null,
        boothId: null,
        boothName: null,
      },
    },
  },
})

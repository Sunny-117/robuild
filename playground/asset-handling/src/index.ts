// Import assets to test loaders
import logoUrl from './assets/logo.png'
import iconSvg from './assets/icon.svg'
import configData from './assets/config.json'

export interface AssetInfo {
  logo: string
  icon: string
  config: any
}

export function getAssets(): AssetInfo {
  return {
    logo: logoUrl,
    icon: iconSvg,
    config: configData
  }
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export const version = '1.0.0'

import * as fs from 'fs'
import * as path from 'path'

export interface ConfigDailyTemplate {
  name: string
  warmup: string
  categories: string[]
  cardio: 'metcon' | 'running' | 'mobility' | 'rest'
}

export interface BaruchConfig {
  dailyTemplates: Record<string, ConfigDailyTemplate>
  settings: {
    defaultExcelFile: string
    allowCustomPercentages: boolean
    showProbabilities: boolean
    showRandomValues: boolean
  }
  metcons: Array<{
    name: string
    description: string
  }>
}

// In-memory storage for config changes (Vercel serverless compatible)
let configOverride: BaruchConfig | null = null

export function loadConfig(): BaruchConfig {
  // Return in-memory config if it exists (user has made changes)
  if (configOverride) {
    return configOverride
  }

  // Otherwise load from default file
  const configPath = path.join(process.cwd(), 'baruch-config.json')

  if (!fs.existsSync(configPath)) {
    throw new Error('baruch-config.json not found in project root')
  }

  const configData = fs.readFileSync(configPath, 'utf8')
  return JSON.parse(configData)
}

export function saveConfig(config: BaruchConfig): void {
  // Store in memory instead of writing to file (Vercel serverless compatible)
  configOverride = config
  console.log('✅ Configuration saved to memory (serverless-compatible)')
}

export function hasConfigOverride(): boolean {
  return configOverride !== null
}
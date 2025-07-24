import { NextApiRequest, NextApiResponse } from 'next'
import * as fs from 'fs'
import * as path from 'path'

interface ConfigDailyTemplate {
  name: string
  warmup: string
  categories: string[]
  cardio: 'metcon' | 'running' | 'mobility' | 'rest'
}

interface BaruchConfig {
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

function loadConfig(): BaruchConfig {
  const configPath = path.join(process.cwd(), 'baruch-config.json')

  if (!fs.existsSync(configPath)) {
    throw new Error('baruch-config.json not found in project root')
  }

  const configData = fs.readFileSync(configPath, 'utf8')
  return JSON.parse(configData)
}

function saveConfig(config: BaruchConfig): void {
  const configPath = path.join(process.cwd(), 'baruch-config.json')
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Return current configuration
      const config = loadConfig()
      res.status(200).json({
        success: true,
        config: config
      })
    } else if (req.method === 'POST') {
      // Update configuration
      const { config } = req.body

      if (!config) {
        return res.status(400).json({
          success: false,
          error: 'Config data is required'
        })
      }

      // Basic validation
      if (!config.dailyTemplates || !config.settings || !config.metcons) {
        return res.status(400).json({
          success: false,
          error: 'Invalid config structure. Missing required sections.'
        })
      }

      // Save the new configuration
      saveConfig(config)

      res.status(200).json({
        success: true,
        message: 'Configuration updated successfully'
      })
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`
      })
    }
  } catch (error) {
    console.error('Config API Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
}
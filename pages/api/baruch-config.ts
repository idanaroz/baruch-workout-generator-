import { NextApiRequest, NextApiResponse } from 'next'
import { loadConfig, saveConfig, hasConfigOverride, BaruchConfig } from '../../lib/config-storage'

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
        message: 'Configuration saved successfully! ✅ Changes are stored in memory and will persist during your session.',
        isTemporary: true
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
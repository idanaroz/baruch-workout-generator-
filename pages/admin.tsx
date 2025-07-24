import React, { useState, useEffect } from 'react'
import Head from 'next/head'

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

const AdminPanel: React.FC = () => {
  const [config, setConfig] = useState<BaruchConfig | null>(null)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'templates' | 'metcons' | 'settings'>('templates')

  useEffect(() => {
    loadConfig()
  }, [])

    const loadConfig = async () => {
    try {
      setLoading(true)

      // Load configuration
      const configResponse = await fetch('/api/baruch-config')
      const configData = await configResponse.json()

      // Load available categories from workout API
      const workoutResponse = await fetch('/api/baruch-workout')
      const workoutData = await workoutResponse.json()

      if (configData.success && workoutData.success) {
        setConfig(configData.config)

        // Extract category names from the workout data
        const categoryNames = workoutData.categories.map((cat: any) => cat.name).sort()
        setAvailableCategories(categoryNames)
      } else {
        setMessage('Failed to load configuration or categories')
      }
    } catch (error) {
      setMessage('Error loading configuration')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!config) return

    try {
      setSaving(true)
      const response = await fetch('/api/baruch-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Configuration saved successfully! ✅ Changes will take effect on next workout generation.')
        setTimeout(() => setMessage(''), 5000)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Error saving configuration')
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateDayTemplate = (day: string, field: keyof ConfigDailyTemplate, value: any) => {
    if (!config) return

    setConfig({
      ...config,
      dailyTemplates: {
        ...config.dailyTemplates,
        [day]: {
          ...config.dailyTemplates[day],
          [field]: value
        }
      }
    })
  }

    const toggleCategoryForDay = (day: string, categoryName: string, isSelected: boolean) => {
    if (!config) return

    const currentCategories = config.dailyTemplates[day].categories
    let newCategories: string[]

    if (isSelected) {
      // Add category if not already present
      newCategories = currentCategories.includes(categoryName)
        ? currentCategories
        : [...currentCategories, categoryName]
    } else {
      // Remove category
      newCategories = currentCategories.filter(cat => cat !== categoryName)
    }

    updateDayTemplate(day, 'categories', newCategories)
  }

  const selectAllCategories = (day: string) => {
    updateDayTemplate(day, 'categories', [...availableCategories])
  }

  const clearAllCategories = (day: string) => {
    updateDayTemplate(day, 'categories', [])
  }

  const addMetcon = () => {
    if (!config) return

    setConfig({
      ...config,
      metcons: [
        ...config.metcons,
        { name: 'New MetCon', description: 'Description here...' }
      ]
    })
  }

  const updateMetcon = (index: number, field: 'name' | 'description', value: string) => {
    if (!config) return

    const newMetcons = [...config.metcons]
    newMetcons[index] = { ...newMetcons[index], [field]: value }

    setConfig({
      ...config,
      metcons: newMetcons
    })
  }

  const removeMetcon = (index: number) => {
    if (!config) return

    setConfig({
      ...config,
      metcons: config.metcons.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load configuration</p>
          <button
            onClick={loadConfig}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Baruch Workout - Admin Panel</title>
        <meta name="description" content="Admin panel for Baruch Workout Generator" />
      </Head>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Admin Panel
          </h1>
          <p className="text-gray-600">
            Configure your Baruch Workout Generator settings
          </p>
          <div className="mt-4">
            <a
              href="/"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Back to Workout Generator
            </a>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('✅')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'templates', label: '📅 Daily Templates', desc: 'Configure workout days' },
                { id: 'metcons', label: '⚡ MetCons', desc: 'Manage CrossFit workouts' },
                { id: 'settings', label: '⚙️ Settings', desc: 'General settings' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div>{tab.label}</div>
                    <div className="text-xs">{tab.desc}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Daily Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Daily Templates</h2>

            {Object.entries(config.dailyTemplates).map(([day, template]) => (
              <div key={day} className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                  {day} - {template.name}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day Name
                    </label>
                    <input
                      type="text"
                      value={template.name}
                      onChange={(e) => updateDayTemplate(day, 'name', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardio Type
                    </label>
                    <select
                      value={template.cardio}
                      onChange={(e) => updateDayTemplate(day, 'cardio', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="metcon">MetCon</option>
                      <option value="running">Running</option>
                      <option value="mobility">Mobility</option>
                      <option value="rest">Rest</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warmup
                  </label>
                  <input
                    type="text"
                    value={template.warmup}
                    onChange={(e) => updateDayTemplate(day, 'warmup', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Exercise Categories
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => selectAllCategories(day)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => clearAllCategories(day)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {availableCategories.map((categoryName) => {
                        const isSelected = template.categories.includes(categoryName)
                        return (
                          <label
                            key={categoryName}
                            className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-indigo-100 border border-indigo-300'
                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => toggleCategoryForDay(day, categoryName, e.target.checked)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className={`text-sm ${isSelected ? 'font-medium text-indigo-800' : 'text-gray-700'}`}>
                              {categoryName}
                            </span>
                          </label>
                        )
                      })}
                    </div>

                    {/* Selected categories summary */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">
                        Selected ({template.categories.length}):
                      </div>
                      <div className="text-sm text-gray-700">
                        {template.categories.length > 0
                          ? template.categories.join(', ')
                          : 'No categories selected'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MetCons Tab */}
        {activeTab === 'metcons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">CrossFit MetCons</h2>
              <button
                onClick={addMetcon}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                + Add MetCon
              </button>
            </div>

            {config.metcons.map((metcon, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow border">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">MetCon #{index + 1}</h3>
                  <button
                    onClick={() => removeMetcon(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={metcon.name}
                      onChange={(e) => updateMetcon(index, 'name', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={metcon.description}
                      onChange={(e) => updateMetcon(index, 'description', e.target.value)}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="21-15-9 For Time:&#10;• Exercise 1&#10;• Exercise 2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">General Settings</h2>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Excel File
                  </label>
                  <input
                    type="text"
                    value={config.settings.defaultExcelFile}
                    onChange={(e) => setConfig({
                      ...config,
                      settings: { ...config.settings, defaultExcelFile: e.target.value }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.settings.allowCustomPercentages}
                      onChange={(e) => setConfig({
                        ...config,
                        settings: { ...config.settings, allowCustomPercentages: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    Allow Custom Percentages
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.settings.showProbabilities}
                      onChange={(e) => setConfig({
                        ...config,
                        settings: { ...config.settings, showProbabilities: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    Show Probabilities
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.settings.showRandomValues}
                      onChange={(e) => setConfig({
                        ...config,
                        settings: { ...config.settings, showRandomValues: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    Show Random Values
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
                    <button
            onClick={saveConfig}
            disabled={saving}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
            } text-white`}
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : '💾 Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
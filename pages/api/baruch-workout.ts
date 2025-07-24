import { NextApiRequest, NextApiResponse } from 'next'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

// Types for Baruch Workout System
interface BaruchExercise {
  name: string
  ratio: number
  helpColumn: number
}

interface BaruchCategory {
  name: string
  exercises: BaruchExercise[]
}

interface DailyTemplate {
  dayIndex: number
  dayName: string
  name: string
  warmup: string
  categories: string[]
  cardio: 'metcon' | 'running' | 'mobility' | 'rest'
}

interface GeneratedWorkout {
  day: string
  dayName: string
  warmup: string
  exercises: Array<{
    category: string
    name: string
    randomValue: number
  }>
  cardio: {
    type: 'metcon' | 'running' | 'mobility' | 'rest'
    name: string
    description: string
  }
  generatedAt: string
}

interface BaruchData {
  templates: DailyTemplate[]
  categories: BaruchCategory[]
  rawExcelData: any
}

// Import shared config storage
import { loadConfig, BaruchConfig } from '../../lib/config-storage'

// Daily Templates are now loaded from baruch-config.json

let cachedBaruchData: BaruchData | null = null

// Get fresh workout data with current config templates
function getFreshWorkoutData(): BaruchData {
  // Parse Excel data (cached)
  if (!cachedBaruchData) {
    cachedBaruchData = parseBaruchExcel()
  }

  // Always use fresh templates from config
  return {
    templates: getTemplatesFromConfig(), // Always fresh from config
    categories: cachedBaruchData.categories, // Cached from Excel
    rawExcelData: cachedBaruchData.rawExcelData // Cached from Excel
  }
}

// Convert config format to internal format
function getTemplatesFromConfig(): DailyTemplate[] {
  const config = loadConfig()
  const templates: DailyTemplate[] = []

  const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  dayOrder.forEach((day, index) => {
    const configTemplate = config.dailyTemplates[day]
    if (configTemplate) {
      templates.push({
        dayIndex: index,
        dayName: day.charAt(0).toUpperCase() + day.slice(1),
        categories: configTemplate.categories,
        cardio: configTemplate.cardio,
        warmup: configTemplate.warmup,
        name: configTemplate.name
      })
    }
  })

  return templates
}

// Update CROSSFIT_METCONS to use config
function getMetconsFromConfig(): Array<{name: string, description: string}> {
  const config = loadConfig()
  return config.metcons.length > 0 ? config.metcons : [
    // Fallback metcons if config is empty
    {
      name: "Fran",
      description: "21-15-9 For Time:\n• Thrusters (95/65 lbs)\n• Pull-Ups"
    },
    {
      name: "Annie",
      description: "50-40-30-20-10 For Time:\n• Double-Unders\n• Sit-Ups"
    },
    {
      name: "Cindy",
      description: "20 Min AMRAP:\n• 5 Pull-Ups\n• 10 Push-Ups\n• 15 Air Squats"
    }
  ]
}

// Parse Baruch Excel File (keep existing implementation)
function parseBaruchExcel(): BaruchData {
  const config = loadConfig()

  // Try multiple paths to handle both local and production environments
  const possiblePaths = [
    // Vercel serverless environment paths
    path.join('/var/task', 'public', 'Baruch_Workout.xlsx'),
    path.join(process.cwd(), 'public', 'Baruch_Workout.xlsx'),
    path.join(__dirname, '../../..', 'public', 'Baruch_Workout.xlsx'),
    path.join(__dirname, '../../../public', 'Baruch_Workout.xlsx'),

    // Fallback paths for other environments
    path.join(process.cwd(), config.settings.defaultExcelFile),
    path.join(__dirname, '../../..', config.settings.defaultExcelFile),
    path.join(__dirname, '../../../..', config.settings.defaultExcelFile),
    config.settings.defaultExcelFile
  ]

  let filePath: string | null = null
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      filePath = testPath
      break
    }
  }

  if (!filePath) {
    console.error('🔍 Detailed Path Debug:')
    console.error('Tried paths:', possiblePaths)
    console.error('Current working directory:', process.cwd())
    console.error('__dirname:', __dirname)

    // Check what files exist in various directories
    try {
      console.error('Root directory contents:', fs.readdirSync(process.cwd()))
    } catch (e) {
      console.error('Cannot read root directory:', e)
    }

    try {
      const publicPath = path.join(process.cwd(), 'public')
      console.error('Public directory exists:', fs.existsSync(publicPath))
      if (fs.existsSync(publicPath)) {
        console.error('Public directory contents:', fs.readdirSync(publicPath))
      }
    } catch (e) {
      console.error('Cannot read public directory:', e)
    }

    throw new Error(`${config.settings.defaultExcelFile} not found. Searched in multiple locations.`)
  }

  const workbook = XLSX.readFile(filePath)

  // Parse Exercises Tab
  const exercisesSheet = workbook.Sheets['Exercises']
  if (!exercisesSheet) {
    throw new Error(`Exercises sheet not found in ${config.settings.defaultExcelFile}`)
  }

  const exercisesData = XLSX.utils.sheet_to_json(exercisesSheet, { header: 1 }) as any[][]

  // Parse categories and exercises with ratios
  const categories: BaruchCategory[] = []

  // Find all category headers across all columns and rows
  const categoryPositions: Array<{name: string, col: number, startRow: number}> = []

  for (let row = 0; row < exercisesData.length; row++) {
    const rowData = exercisesData[row]
    if (!rowData) continue

    for (let col = 0; col < rowData.length; col++) {
      const cell = rowData[col]
      if (cell && typeof cell === 'string') {
        // Check if this is a category header ending with ':'
        if (cell.endsWith(':')) {
          const categoryName = cell.replace(':', '').trim()
          // Skip column headers like "Ratio", "Help Column", etc.
          if (categoryName.toLowerCase() !== 'ratio' && categoryName.toLowerCase() !== 'help column') {
            categoryPositions.push({
              name: categoryName,
              col: col,
              startRow: row + 1 // Exercises start from next row
            })
          }
        }
        // Also check if this looks like a category header by examining the next two cells
        else if (col + 2 < rowData.length &&
                 rowData[col + 1]?.toString().toLowerCase().includes('ratio') &&
                 rowData[col + 2]?.toString().toLowerCase().includes('help')) {
          const categoryName = cell.trim()
          // Skip obvious column headers
          if (categoryName.toLowerCase() !== 'ratio' &&
              categoryName.toLowerCase() !== 'help column' &&
              categoryName.length > 2) {
            categoryPositions.push({
              name: categoryName,
              col: col,
              startRow: row + 1 // Exercises start from next row
            })
          }
        }
      }
    }
  }

  // Parse exercises for each category
  for (const categoryPos of categoryPositions) {
    const category: BaruchCategory = {
      name: categoryPos.name,
      exercises: []
    }

    // Find exercises in this category's column
    for (let row = categoryPos.startRow; row < exercisesData.length; row++) {
      const rowData = exercisesData[row]
      if (!rowData || !rowData[categoryPos.col]) continue

      const exerciseName = rowData[categoryPos.col]?.toString().trim()
      if (!exerciseName) continue

      // Stop if we hit another category header (with or without colon)
      if (exerciseName.endsWith(':')) break

      // Also stop if this cell is a known category name from our positions list
      const isAnotherCategory = categoryPositions.some(pos =>
        pos.name === exerciseName || pos.name === exerciseName.replace(':', '')
      )
      if (isAnotherCategory && row > categoryPos.startRow) break

      // Get ratio and help column values
      const ratioCell = rowData[categoryPos.col + 1] // Next column should be ratio
      const helpCell = rowData[categoryPos.col + 2]  // Column after that should be help column

      if (ratioCell !== undefined && helpCell !== undefined) {
        const ratio = parseFloat(ratioCell.toString()) || 0
        const helpColumn = parseFloat(helpCell.toString()) || 0

        category.exercises.push({
          name: exerciseName,
          ratio: ratio,
          helpColumn: helpColumn
        })
      }
    }

    // Only add categories that have exercises
    if (category.exercises.length > 0) {
      categories.push(category)
    }
  }

  return {
    templates: getTemplatesFromConfig(), // Use config instead of hardcoded
    categories: categories,
    rawExcelData: {
      exercises: exercisesData
    }
  }
}

// Weighted Random Selection using Help Column
function selectExerciseFromCategory(category: BaruchCategory): { exercise: BaruchExercise, randomValue: number } {
  if (category.exercises.length === 0) {
    throw new Error(`No exercises found in category: ${category.name}`)
  }

  const randomValue = Math.random() // 0-1 to match Help Column decimal values

  // Find exercise based on Help Column ranges
  for (let i = 0; i < category.exercises.length; i++) {
    const exercise = category.exercises[i]
    const prevHelpColumn = i === 0 ? 0 : category.exercises[i - 1].helpColumn

    if (randomValue >= prevHelpColumn && randomValue <= exercise.helpColumn) {
      return { exercise, randomValue: randomValue * 100 } // Convert back to percentage for display
    }
  }

  // Fallback to last exercise if no match found
  const lastExercise = category.exercises[category.exercises.length - 1]
  return { exercise: lastExercise, randomValue: randomValue * 100 }
}

// Generate Workout based on daily template
function generateWorkout(dayIndex: number, data: BaruchData): GeneratedWorkout {
  const template = data.templates.find(t => t.dayIndex === dayIndex)
  if (!template) {
    throw new Error(`No template found for day index: ${dayIndex}`)
  }

     const exercises: Array<{
     category: string
     name: string
     randomValue: number
   }> = []

   // Generate exercises for each category in the template
   for (const categoryName of template.categories) {
     const category = data.categories.find(c => c.name === categoryName)
     if (category) {
       const { exercise, randomValue } = selectExerciseFromCategory(category)
       exercises.push({
         category: categoryName,
         name: exercise.name,
         randomValue: randomValue
       })
     } else {
       console.warn(`Category "${categoryName}" not found in Excel data`)
     }
   }

  // Generate cardio component
  let cardio: any = null
  const metcons = getMetconsFromConfig() // Use config metcons

  switch (template.cardio) {
    case 'metcon':
      const randomMetcon = metcons[Math.floor(Math.random() * metcons.length)]
      cardio = {
        type: 'metcon',
        name: randomMetcon.name,
        description: randomMetcon.description
      }
      break
    case 'running':
      cardio = {
        type: 'running',
        name: 'Running Session',
        description: 'Cardio running workout'
      }
      break
    case 'mobility':
      cardio = {
        type: 'mobility',
        name: 'Mobility Session',
        description: 'Flexibility and mobility work'
      }
      break
    case 'rest':
      cardio = {
        type: 'rest',
        name: 'Rest Day',
        description: 'Recovery and rest'
      }
      break
  }

  return {
    day: template.dayName,
    dayName: template.name, // Use the friendly name from config
    warmup: template.warmup,
    exercises: exercises,
    cardio: cardio,
    generatedAt: new Date().toISOString()
  }
}

// Get current day index (Sunday = 0, Monday = 1, etc.)
function getCurrentDayIndex(): number {
  return new Date().getDay()
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Get fresh workout data (combines cached Excel + fresh config)
      const workoutData = getFreshWorkoutData()

      const { day } = req.query
      let dayIndex = getCurrentDayIndex()

      // Allow user to specify different day
      if (day && typeof day === 'string') {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const specifiedDay = dayNames.indexOf(day.toLowerCase())
        if (specifiedDay >= 0) {
          dayIndex = specifiedDay
        }
      }

      const workout = generateWorkout(dayIndex, workoutData)

      res.status(200).json({
        success: true,
        workout: workout,
        availableDays: workoutData.templates.map(t => t.dayName),
        categories: workoutData.categories.map(cat => ({
          name: cat.name,
          exerciseCount: cat.exercises.length,
          exercises: cat.exercises.map(ex => ({
            name: ex.name,
            ratio: ex.ratio,
            helpColumn: ex.helpColumn
          }))
        }))
      })
    } else if (req.method === 'POST') {
      // Force regenerate workout (re-randomize)
      const { day } = req.body

      // Get fresh workout data (combines cached Excel + fresh config)
      const workoutData = getFreshWorkoutData()

      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      let dayIndex = getCurrentDayIndex()

      if (day && typeof day === 'string') {
        const specifiedDay = dayNames.indexOf(day.toLowerCase())
        if (specifiedDay >= 0) {
          dayIndex = specifiedDay
        }
      }

      const workout = generateWorkout(dayIndex, workoutData)

      res.status(200).json({
        success: true,
        workout: workout,
        regenerated: true
      })
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: any) {
    console.error('Baruch Workout API Error:', error)
    res.status(500).json({
      error: 'Failed to process Baruch workout',
      details: error.message
    })
  }
}
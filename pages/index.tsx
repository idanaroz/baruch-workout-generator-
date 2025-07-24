import React, { useState, useEffect } from 'react'
import Head from 'next/head'

// Types
interface WorkoutExercise {
  category: string
  name: string
  randomValue: number
}

interface BaruchExercise {
  name: string
  ratio: number
  helpColumn: number
}

interface BaruchCategory {
  name: string
  exerciseCount: number
  exercises: BaruchExercise[]
}

interface GeneratedWorkout {
  day: string
  dayName: string
  warmup: string
  exercises: WorkoutExercise[]
  cardio: {
    type: 'metcon' | 'running' | 'mobility' | 'rest'
    name: string
    description: string
  }
  generatedAt: string
}

interface BaruchResponse {
  success: boolean
  workout: GeneratedWorkout
  availableDays: string[]
  categories: BaruchCategory[]
  regenerated?: boolean
}

const BaruchWorkoutGenerator: React.FC = () => {
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null)
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [categories, setCategories] = useState<BaruchCategory[]>([])
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [showExcelData, setShowExcelData] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Load initial workout (today's workout)
  useEffect(() => {
    loadWorkout()
  }, [])

  const loadWorkout = async (day?: string) => {
    try {
      setLoading(true)
      const url = day ? `/api/baruch-workout?day=${day.toLowerCase()}` : '/api/baruch-workout'
      const response = await fetch(url)
      const data: BaruchResponse = await response.json()

      if (data.success) {
        setWorkout(data.workout)
        setAvailableDays(data.availableDays)
        setCategories(data.categories)
        setSelectedDay(data.workout.day)
      } else {
        console.error('Failed to load workout')
      }
    } catch (error) {
      console.error('Error loading workout:', error)
    } finally {
      setLoading(false)
    }
  }

  const regenerateWorkout = async () => {
    try {
      setRegenerating(true)
      const response = await fetch('/api/baruch-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ day: selectedDay }),
      })
      const data: BaruchResponse = await response.json()

      if (data.success) {
        setWorkout(data.workout)
      }
    } catch (error) {
      console.error('Error regenerating workout:', error)
    } finally {
      setRegenerating(false)
    }
  }

  const handleDayChange = (day: string) => {
    setSelectedDay(day)
    loadWorkout(day)
  }

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName)
    } else {
      newExpanded.add(categoryName)
    }
    setExpandedCategories(newExpanded)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Baruch Workout System...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Baruch Workout Generator</title>
        <meta name="description" content="Generate personalized CrossFit-style workouts using weighted random selection" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
          <span className="inline-block w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg mr-3 text-center leading-10 text-white font-bold text-xl">B</span>
          Baruch Workout Generator
        </h1>
          <p className="text-lg text-gray-600">Dynamic CrossFit-style workouts with weighted random selection</p>
          <div className="mt-4">
            <a
              href="/admin"
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
            >
              🔧 Admin Panel (Configure Workouts)
            </a>
          </div>
        </div>

        {/* Day Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📅 Select Day</h2>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {availableDays.map((day) => (
              <button
                key={day}
                onClick={() => handleDayChange(day)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedDay === day
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Current Workout */}
        {workout && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                <span className="inline-flex items-center">
                <span className="inline-block w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md mr-2 text-center leading-6 text-white font-bold text-sm">W</span>
                {workout.day}'s Workout
              </span>
              </h2>
              <button
                onClick={regenerateWorkout}
                disabled={regenerating}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                {regenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    🎲 Generate New Workout
                  </>
                )}
              </button>
            </div>

            {/* Warmup */}
            <div className="mb-6">
                              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  <span className="inline-flex items-center">
                    <span className="inline-block w-5 h-5 bg-gradient-to-br from-yellow-500 to-orange-500 rounded mr-2 text-center leading-5 text-white font-bold text-xs">W</span>
                    Warmup
                  </span>
                </h3>
              <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg">{workout.warmup}</p>
            </div>

            {/* Exercises */}
            {workout.exercises.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">�� Strength Circuit</h3>
                <div className="grid gap-4">
                  {workout.exercises.map((exercise, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-indigo-600 rounded-full mr-1">
                            {index + 1}
                          </span>
                          <span className="text-lg font-semibold text-gray-800 ml-2">
                            {exercise.name}
                          </span>
                          <div className="text-sm text-gray-500 mt-1">
                            Category: {exercise.category}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Random: {exercise.randomValue.toFixed(2)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cardio Component */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {workout.cardio.type === 'metcon' && '⚡ MetCon'}
                {workout.cardio.type === 'running' && '🏃 Cardio'}
                {workout.cardio.type === 'mobility' && '🧘 Mobility'}
                {workout.cardio.type === 'rest' && '😴 Recovery'}
              </h3>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <div className="text-gray-700">
                  <div className="font-bold text-green-700 mb-2">{workout.cardio.name}</div>
                  <pre className="whitespace-pre-wrap font-medium">
                    {workout.cardio.description}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

                 {/* Excel Data Viewer */}
         <div className="bg-white rounded-xl shadow-lg p-6">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-semibold text-gray-800">📊 Exercise Database</h2>
             <button
               onClick={() => setShowExcelData(!showExcelData)}
               className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
             >
               {showExcelData ? 'Hide' : 'Show'} Categories
             </button>
           </div>

           {showExcelData && (
             <div className="space-y-4">
               {categories.map((category, index) => (
                 <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                   {/* Category Header */}
                   <button
                     onClick={() => toggleCategory(category.name)}
                     className="w-full bg-gray-50 hover:bg-gray-100 p-4 text-left transition-colors duration-200 flex justify-between items-center"
                   >
                     <div>
                       <h4 className="font-semibold text-gray-800 text-lg">{category.name}</h4>
                       <p className="text-sm text-gray-600">{category.exerciseCount} exercises</p>
                     </div>
                     <div className="text-gray-500">
                       {expandedCategories.has(category.name) ? (
                         <span className="text-xl">📁</span>
                       ) : (
                         <span className="text-xl">📂</span>
                       )}
                     </div>
                   </button>

                   {/* Expanded Exercises */}
                   {expandedCategories.has(category.name) && (
                     <div className="bg-white p-4 border-t border-gray-200">
                       <div className="grid gap-3">
                         {category.exercises.map((exercise, exerciseIndex) => (
                           <div key={exerciseIndex} className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-indigo-300">
                             <div>
                               <span className="font-medium text-gray-800">{exercise.name}</span>
                             </div>
                             <div className="text-right">
                               <div className="text-sm text-indigo-600 font-semibold">{exercise.ratio}%</div>
                               <div className="text-xs text-gray-500">≤{exercise.helpColumn}%</div>
                             </div>
                           </div>
                         ))}
                       </div>

                       {/* Category Statistics */}
                       <div className="mt-4 pt-4 border-t border-gray-100">
                         <div className="text-center">
                           <span className="text-xs text-gray-500">
                             🎲 Weighted Random Selection • Total: {category.exercises.reduce((sum, ex) => sum + ex.ratio, 0)}%
                           </span>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}
         </div>

         {/* Footer */}
         <div className="text-center mt-8 text-gray-500">
           <p>🎯 Built with weighted random selection from Baruch Excel database</p>
         </div>
       </div>
     </div>
   )
 }

 export default BaruchWorkoutGenerator

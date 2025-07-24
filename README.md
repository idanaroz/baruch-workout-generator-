# 💪 Baruch Workout Generator

A modern web application that generates personalized CrossFit-style workouts based on data from Excel files with weighted probability selection.

## ✨ Features

### 🎯 **Core Functionality**
- **📊 Excel Integration** - Automatically parses `Baruch_Workout.xlsx` with multi-column exercise categories
- **🎲 Weighted Randomization** - Uses Ratio and Help Column data for intelligent exercise selection
- **📅 Daily Templates** - Different workout structures for each day of the week
- **⚡ CrossFit MetCons** - Random selection from classic CrossFit workouts (Fran, Annie, Cindy, etc.)
- **🏋️‍♂️ Exercise Database** - Expandable view of all exercise categories with probabilities
- **🔧 Admin Panel** - Web-based configuration interface for easy customization

### 🚀 **Advanced Features**
- **🎯 Smart Selection** - Respects exercise probability weighting from Excel data
- **📱 Responsive Design** - Works seamlessly on desktop and mobile
- **⚙️ Configuration System** - JSON-based config for daily templates, MetCons, and settings
- **🔄 Real-time Generation** - Instant workout creation and regeneration
- **✅ Error-Proof UI** - Checkbox-based category selection prevents configuration errors

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- `Baruch_Workout.xlsx` file in the project root

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Open in browser:**
   - Main app: [http://localhost:3000](http://localhost:3000)
   - Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📊 Excel File Structure

The system expects `Baruch_Workout.xlsx` with:

- **Exercises Sheet**: Multi-column layout with categories, exercises, ratios, and help columns
- **Categories**: Exercise groups like "Squats:", "Core:", "Shoulder Press:", etc.
- **Probability System**: Each exercise has a ratio (individual %) and help column (cumulative %)

Example structure:
```
| Squats:     | Ratio: | Help Column | | Lunges:    | Ratio: | Help Column |
| Back Squat  | 0.16   | 0.16        | | Lunge      | 0.09   | 0.09        |
| Front Squat | 0.16   | 0.32        | | Back Lunge | 0.09   | 0.18        |
```

## ⚙️ Configuration

### Daily Templates
Edit workout templates through the admin panel or directly in `baruch-config.json`:

```json
{
  "dailyTemplates": {
    "sunday": {
      "name": "Legs Day",
      "categories": ["Squats", "Lunges", "Legs Accessories", "Core"],
      "cardio": "metcon"
    }
  }
}
```

### Adding MetCons
Customize CrossFit workouts in the admin panel or config file:

```json
{
  "metcons": [
    {
      "name": "Custom WOD",
      "description": "21-15-9 For Time:\n• Exercise 1\n• Exercise 2"
    }
  ]
}
```

## 🎮 Usage

### Main Interface
1. **View Today's Workout** - Automatically shows current day's workout
2. **Switch Days** - Use day selector to view other workout templates
3. **Generate New Workout** - Click "🎲 Generate New Workout" for different exercises
4. **View Exercise Database** - Expand categories to see all available exercises

### Admin Panel
1. **Daily Templates** - Modify exercise categories for each day using checkboxes
2. **MetCon Management** - Add, edit, or remove CrossFit workouts
3. **Settings** - Configure file paths and display options

## 🛠️ Development

### Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run linting

### Architecture
- **Backend**: Next.js API routes with Excel parsing (`xlsx` library)
- **Frontend**: React with TypeScript and Tailwind CSS
- **Data Flow**: Excel → Config → Weighted Selection → Workout Generation
- **Caching**: Excel data cached, templates always fresh from config

## 📁 Project Structure

```
├── pages/
│   ├── index.tsx           # Main workout generator
│   ├── admin.tsx           # Configuration panel
│   └── api/
│       ├── baruch-workout.ts  # Workout generation API
│       └── baruch-config.ts   # Configuration API
├── baruch-config.json      # Daily templates and settings
├── Baruch_Workout.xlsx     # Exercise database
└── README-CONFIG.md        # Configuration guide
```

## 📚 Documentation

- **[Configuration Guide](README-CONFIG.md)** - Complete setup and customization guide
- **[Development Log](cursor-log.md)** - Full project development history

## 🎯 Key Benefits

- **Zero Setup** - Works immediately with your Excel file
- **Intelligent Selection** - Respects exercise probability weighting
- **Fully Customizable** - Easy configuration without code changes
- **Production Ready** - Clean architecture with error handling
- **Extensible** - Config-based system supports unlimited customization

---

**Built for fitness enthusiasts who want intelligent, varied workouts based on their own exercise database.** 💪
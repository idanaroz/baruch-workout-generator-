# 🔧 Baruch Workout Generator - Configuration Guide

## Overview

Your Baruch Workout Generator now supports **easy configuration** through the `baruch-config.json` file and a web-based admin panel! This allows you to:

- ✅ **Modify daily workout templates** without touching code
- ✅ **Add/edit CrossFit MetCons** through the UI
- ✅ **Change exercise categories** for any day
- ✅ **Adjust settings** and file paths
- ✅ **Version control** your configurations with git

---

## 🎯 Quick Start

### Option 1: Web Interface (Recommended)
1. Visit **http://localhost:3000/admin**
2. Edit daily templates with checkbox selection, MetCons, and settings
3. Click "💾 Save Configuration"
4. Changes take effect immediately!

### Option 2: Direct File Editing
1. Edit `baruch-config.json` in the project root
2. Save the file
3. Restart the app or refresh the page

---

## 📁 Configuration Structure

```json
{
  "dailyTemplates": {
    "sunday": {
      "name": "Legs Day",
      "warmup": "5 Minutes Aerobic Warmup + Dynamic Mobility",
      "categories": ["Squats", "Lunges", "Legs Accessories", "Core"],
      "cardio": "metcon"
    }
    // ... other days
  },
  "settings": {
    "defaultExcelFile": "Baruch_Workout.xlsx",
    "allowCustomPercentages": true,
    "showProbabilities": true,
    "showRandomValues": true
  },
  "metcons": [
    {
      "name": "Fran",
      "description": "21-15-9 For Time:\n• Thrusters (95/65 lbs)\n• Pull-Ups"
    }
    // ... more MetCons
  ]
}
```

---

## 🔥 Common Customizations

### Add a New Day Template
```json
"sunday": {
  "name": "Custom Arms Day",
  "warmup": "10 Minutes Dynamic Warmup",
  "categories": ["Biceps", "Triceps", "Shoulder Press", "Core"],
  "cardio": "metcon"
}
```

### Change Workout Categories
```json
// Want 6 exercises on Wednesday instead of 5?
"wednesday": {
  "categories": ["Deadlifts", "Back General:", "Pullups:", "Biceps", "Core", "Traps/Forarms"]
}

// Want a pure strength day?
"thursday": {
  "categories": ["Squats", "Deadlifts", "Chest Main"],
  "cardio": "mobility"
}
```

### Add Custom MetCons
```json
"metcons": [
  {
    "name": "My Custom WOD",
    "description": "5 Rounds For Time:\n• 10 Burpees\n• 15 KB Swings\n• 20 Air Squats"
  }
]
```

### Modify Settings
```json
"settings": {
  "defaultExcelFile": "My_Custom_Workout.xlsx",  // Use different Excel file
  "showProbabilities": false,                    // Hide probability displays
  "showRandomValues": false                      // Hide random value displays
}
```

---

## 📊 Exercise Categories Reference

**Available categories from your Excel file:**
- `Squats`
- `Lunges`
- `Legs Accessories`
- `Core`
- `Shoulder Press`
- `Handstand Variation`
- `Shoulder Press Accessories`
- `Traps/Forarms`
- `Deadlifts`
- `Back General:`
- `Pullups:`
- `Biceps`
- `Chest Main`
- `Chest Accessories`
- `Triceps`
- `C&J accessories`
- `Weightligting Clean & Jerk`
- `Snatch Accessories`
- `Clean accessories`
- `Jerk accessories`
- `Weightligting Snatch`
- `Girls Benchmarks`
- `Heroes Benchmarks`
- `Gymnastics Benchmark 1`
- `Gymnastics Benchmark 2`

> ⚠️ **Note:** Category names must match exactly as they appear in your Excel file.

---

## ⚡ Cardio Types

- **`metcon`** - Random CrossFit MetCon from your list
- **`running`** - Cardio/running session
- **`mobility`** - Flexibility and mobility work
- **`rest`** - Recovery day

---

## 🚀 Advanced Usage

### Multiple Excel Files
```json
// Switch between different Excel databases
"settings": {
  "defaultExcelFile": "Baruch_Beginner.xlsx"    // For beginners
  // or "Baruch_Advanced.xlsx"                  // For advanced athletes
}
```

### Seasonal Variations
```bash
# Save different configs for different seasons
cp baruch-config.json baruch-config-summer.json
cp baruch-config.json baruch-config-winter.json

# Switch configs as needed
cp baruch-config-summer.json baruch-config.json
```

### Backup Your Configuration
```bash
# Always backup before major changes
cp baruch-config.json baruch-config-backup.json
```

---

## 🐛 Troubleshooting

### Config File Not Found
- Ensure `baruch-config.json` exists in the project root
- Check file permissions
- Validate JSON syntax at [jsonlint.com](https://jsonlint.com)

### Categories Not Working
- Verify category names match Excel file exactly
- Check for typos (case-sensitive)
- Use the "📊 Exercise Database" section to see available categories

### Changes Not Appearing
- Restart the development server (`npm run dev`)
- Clear browser cache
- Check browser console for errors

---

## 🎯 Extension Ideas

With this flexible system, you can easily:

1. **🗓️ Create themed weeks** (Strength Week, Cardio Week, etc.)
2. **👥 Different user profiles** (Beginner, Intermediate, Advanced configs)
3. **🎯 Specialized training** (Competition prep, Off-season, etc.)
4. **🌍 Multiple languages** (Translate day names and descriptions)
5. **📈 Progressive overload** (Gradually increase exercise complexity)

---

## 📝 API Endpoints

- **GET** `/api/baruch-config` - Retrieve current configuration
- **POST** `/api/baruch-config` - Update configuration
- **GET** `/api/baruch-workout` - Generate workout (uses config)
- **POST** `/api/baruch-workout` - Regenerate workout

---

## 🤝 Contributing

Found a bug or want to suggest an improvement?

1. Edit your `baruch-config.json`
2. Test your changes
3. Share your configuration with the community!

---

**🎉 Enjoy your configurable workout generator!**

Your system is now **fully extensible** - modify daily templates, add exercises, create custom MetCons, and adjust settings all through the elegant web interface! 💪
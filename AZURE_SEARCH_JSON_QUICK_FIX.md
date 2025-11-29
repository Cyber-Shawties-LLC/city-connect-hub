# Quick Fix for Azure Search JSON Error

## Current Error
```
Invalid JSON. A token was not recognized in the JSON content.
```

## The Problem
1. **Line 1 has `json`** - This is not valid JSON syntax. Remove it.
2. **Missing closing bracket `]`** - Your array starts with `[` but doesn't end with `]`

## The Fix

### Step 1: Remove `json` from line 1
- Delete the word `json` on line 1
- Your JSON should start directly with `[`

### Step 2: Add closing bracket
- At the very end of your JSON, after the last `}`, add `]`

## Correct Format

```json
[
  {
    "id": "norfolk-001",
    "title": "Norfolk City Council Meeting",
    "description": "Monthly city council meeting to discuss local issues, budget proposals, and upcoming projects. Public comment welcome.",
    "date": "2025-12-05T19:00:00Z",
    "location": "City Hall, 100 Main St, Norfolk, VA 23510",
    "city": "Norfolk",
    "state": "VA",
    "category": "Government",
    "url": "https://norfolk.gov/events/council-meeting-dec-5",
    "organizer": "Norfolk City Council",
    "contact": "council@norfolk.gov"
  },
  {
    "id": "norfolk-002",
    "title": "Norfolk Farmers Market",
    "description": "Weekly farmers market featuring local produce, handmade crafts, and food vendors. Live music and family-friendly activities.",
    "date": "2025-12-07T08:00:00Z",
    "location": "Downtown Plaza, Norfolk, VA",
    "city": "Norfolk",
    "state": "VA",
    "category": "Community",
    "url": "https://norfolk.gov/farmers-market",
    "organizer": "Norfolk Parks & Recreation",
    "contact": "parks@norfolk.gov"
  }
]
```

## Quick Checklist

- [ ] Line 1 starts with `[` (not `json`)
- [ ] Last line ends with `]`
- [ ] All objects are separated by commas
- [ ] No trailing comma after the last object
- [ ] All property names are in quotes: `"id"`, `"title"`, etc.
- [ ] All string values are in quotes: `"Norfolk"`, `"VA"`, etc.

## Alternative: Use the Template File

Instead of manually fixing, you can copy the entire content from `scripts/events_template.json` - it's already in the correct format!


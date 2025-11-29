# Azure Search Index JSON Format Fix

## The Problem

When uploading JSON to Azure Search Index, you're getting this error:
```
Invalid JSON. An unexpected comma was found in scope 'Root'. 
A comma is only valid between properties of an object or between elements of an array.
```

## The Solution

Azure Search Index JSON editor expects **one of two formats**:

### Format 1: Single Object
```json
{
  "id": "norfolk-001",
  "title": "Event Title",
  ...
}
```

### Format 2: Array of Objects (for multiple events)
```json
[
  {
    "id": "norfolk-001",
    "title": "Event Title",
    ...
  },
  {
    "id": "norfolk-002",
    "title": "Another Event",
    ...
  }
]
```

## What You're Probably Doing Wrong

If you're copying multiple events, you might be doing this (WRONG):
```json
{
  "id": "norfolk-001",
  ...
},
{
  "id": "norfolk-002",
  ...
}
```

**This is invalid** because you have multiple objects with commas but no array wrapper.

## The Fix

**Wrap your JSON in square brackets `[` and `]`:**

1. **Before your first event**, add `[`
2. **After your last event**, add `]`
3. Make sure there's a comma between each event object (except the last one)

### Example - Correct Format:

```json
[
  {
    "id": "norfolk-001",
    "title": "Norfolk City Council Meeting",
    "description": "Monthly city council meeting...",
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
    "description": "Weekly farmers market...",
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

## Quick Steps to Fix

1. **Copy your JSON** from the editor
2. **Add `[` at the very beginning**
3. **Add `]` at the very end**
4. **Paste it back** into the Azure Search Index JSON editor
5. **Click "Save"**

## Using the Template File

If you're using `scripts/events_template.json`, it's already in the correct format (array of objects). Just copy the entire file content and paste it into Azure Search Index JSON editor.

## Validation Checklist

Before saving, make sure:
- [ ] JSON starts with `[` (for multiple events) or `{` (for single event)
- [ ] JSON ends with `]` (for multiple events) or `}` (for single event)
- [ ] All objects are separated by commas (except the last one)
- [ ] All property names are in quotes: `"id"`, `"title"`, etc.
- [ ] All string values are in quotes: `"Norfolk"`, `"VA"`, etc.
- [ ] No trailing comma after the last object in the array
- [ ] All dates are in ISO format: `"2025-12-05T19:00:00Z"`

## Common Mistakes

### ❌ Wrong: Missing array brackets
```json
{
  "id": "event-1"
},
{
  "id": "event-2"
}
```

### ✅ Correct: Wrapped in array
```json
[
  {
    "id": "event-1"
  },
  {
    "id": "event-2"
  }
]
```

### ❌ Wrong: Trailing comma after last item
```json
[
  {
    "id": "event-1"
  },
  {
    "id": "event-2"
  },  ← Remove this comma!
]
```

### ✅ Correct: No trailing comma
```json
[
  {
    "id": "event-1"
  },
  {
    "id": "event-2"
  }
]
```

## Still Having Issues?

1. **Validate your JSON** using an online JSON validator (jsonlint.com)
2. **Check for special characters** in strings (escape them with `\`)
3. **Make sure all quotes are straight quotes** (`"` not `"` or `"`)
4. **Copy the template file** (`scripts/events_template.json`) - it's already in the correct format


# Client Property Matching Engine

## Purpose

Automatically match qualified clients with the most relevant properties based on structured preferences and property features.

This system removes manual guessing and ranks properties using deterministic scoring.

---

## Concept Overview

The matching engine compares a client profile against available properties and returns a ranked list with a compatibility score from 0 to 100.

Matching is deterministic.  
No AI.  
Fully explainable.

---

## Data We Already Have

### Client Data

Client profile contains

1 Budget range  
2 Preferred locations  
3 Minimum bedrooms  
4 Bathrooms  
5 Payment type cash or mortgage  
6 Property type apartment villa townhouse  
7 Must have features  
8 Nice to have features  

### Property Data

Property contains

1 Price  
2 Location  
3 Bedrooms  
4 Bathrooms  
5 Amenities  
6 Pool  
7 Balcony  
8 Creek view lagoon sea view  
9 Off plan or ready  
10 Developer  
11 Project  

This covers more than 80 percent of required inputs.

---

## Matching Levels

Client preferences are split into three levels.

### Hard Requirements

If any hard requirement fails, the property is rejected.

Examples

1 Budget max 1.8M  
2 Minimum 2 bedrooms  
3 Location Dubai Marina or Business Bay  
4 Ready property only  

### Soft Preferences

If matched, score increases significantly.

Examples

1 Balcony  
2 Pool  
3 Parking  

### Bonus Preferences

Luxury or emotional features.

Examples

1 Sea view  
2 High floor  
3 Branded residence  

---

## Matching Logic

For each property

1 Check hard requirements  
2 If any hard requirement fails, reject property  
3 Score soft preferences  
4 Score bonus preferences  
5 Normalize score to percentage  
6 Return ranked result  

Final output is a list of compatible properties sorted by score.

---

## Scoring System

Hard requirements  
Pass or fail  
No points awarded

Soft preferences  
Each match adds 15 points

Bonus preferences  
Each match adds 5 points

Base score  
20 points

Maximum score  
100 points

Example

Soft matches 4 x 15 = 60  
Bonus matches 4 x 5 = 20  
Base score = 20  

Total = 100

---

## TypeScript Data Models

### Client Preferences

```ts
export interface ClientPreferences {
  budgetMin: number
  budgetMax: number
  locations: string[]
  bedroomsMin: number
  propertyType: "apartment" | "villa" | "townhouse"
  readyOnly: boolean

  mustHave: {
    balcony?: boolean
    pool?: boolean
    parking?: boolean
  }

  niceToHave: {
    seaView?: boolean
    creekView?: boolean
    branded?: boolean
    highFloor?: boolean
  }
}

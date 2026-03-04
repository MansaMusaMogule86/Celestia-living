# CRM Feature Implementation Plan

## Overview

This document outlines the implementation plan for 8 major feature enhancements to the Ilan CRM system.

---

## Feature 1: Photo Upload/Modification System

### Description

Enable users to upload and modify photos for properties and client profiles with drag-and-drop support and image preview.

### Technical Implementation

- **Frontend Components:**
  - `ImageUploader.tsx` - Drag-and-drop file upload component
  - `ImageGallery.tsx` - Display and manage multiple images
  - `ImageEditor.tsx` - Basic crop/rotate functionality
  
- **Backend:**
  - File upload API endpoint (`/api/upload`)
  - Image storage (local filesystem or cloud storage like S3)
  - Image optimization and thumbnail generation
  
- **Database Schema:**

  ```prisma
  model Image {
    id          String   @id @default(cuid())
    url         String
    thumbnailUrl String?
    propertyId  String?
    clientId    String?
    uploadedBy  String
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
  }
  ```

### Dependencies

- `react-dropzone` for file uploads
- `sharp` or similar for image processing

---

## Feature 2: Admin Access Control & Property Assignment

### Description

Admin can control which agents have access to specific properties and assign properties to agents.

### Technical Implementation

- **Frontend Components:**
  - `AccessControlPanel.tsx` - Manage user permissions
  - `PropertyAssignment.tsx` - Assign properties to agents
  - `PermissionMatrix.tsx` - Visual permission grid
  
- **Backend:**
  - Role-based access control (RBAC) middleware
  - Property assignment service
  - Permission checking utilities
  
- **Database Schema:**

  ```prisma
  model User {
    id          String   @id @default(cuid())
    email       String   @unique
    name        String
    role        Role     @default(AGENT)
    permissions PropertyAccess[]
    assignments PropertyAssignment[]
  }

  enum Role {
    ADMIN
    AGENT
    VIEWER
  }

  model PropertyAccess {
    id         String   @id @default(cuid())
    userId     String
    propertyId String
    canView    Boolean  @default(true)
    canEdit    Boolean  @default(false)
    user       User     @relation(fields: [userId], references: [id])
  }

  model PropertyAssignment {
    id         String   @id @default(cuid())
    userId     String
    propertyId String
    assignedAt DateTime @default(now())
    assignedBy String
    user       User     @relation(fields: [userId], references: [id])
  }
  ```

---

## Feature 3: Document Generator & E-Signature

### Description

Generate one-page PDF documents that clients can fill out and sign electronically.

### Technical Implementation

- **Frontend Components:**
  - `DocumentForm.tsx` - Dynamic form builder
  - `SignaturePad.tsx` - Canvas-based signature capture
  - `DocumentPreview.tsx` - PDF preview before signing
  
- **Backend:**
  - PDF generation service using `pdfkit` or `puppeteer`
  - Document template engine
  - E-signature storage and verification
  
- **Database Schema:**

  ```prisma
  model Document {
    id           String   @id @default(cuid())
    templateId   String
    clientId     String
    formData     Json
    signatureUrl String?
    status       DocumentStatus @default(DRAFT)
    createdAt    DateTime @default(now())
    signedAt     DateTime?
    pdfUrl       String?
  }

  enum DocumentStatus {
    DRAFT
    SENT
    SIGNED
    COMPLETED
  }

  model DocumentTemplate {
    id          String   @id @default(cuid())
    name        String
    fields      Json     // Field definitions
    htmlTemplate String  @db.Text
  }
  ```

### Dependencies

- `react-signature-canvas` for signatures
- `pdfkit` or `@react-pdf/renderer` for PDF generation
- `jspdf` for client-side PDF generation

---

## Feature 4: Activity History & Audit Log

### Description

Comprehensive activity tracking that admins can view but agents cannot modify.

### Technical Implementation

- **Frontend Components:**
  - `ActivityTimeline.tsx` - Chronological activity display
  - `ActivityFilters.tsx` - Filter by user, date, action type
  - `ActivityDetails.tsx` - Detailed view of specific activities
  
- **Backend:**
  - Activity logging middleware (auto-capture all actions)
  - Read-only API for activity retrieval
  - Activity aggregation service
  
- **Database Schema:**

  ```prisma
  model Activity {
    id          String   @id @default(cuid())
    userId      String
    action      String   // e.g., "created_property", "updated_client"
    entityType  String   // e.g., "property", "client", "deal"
    entityId    String
    metadata    Json?    // Additional context
    ipAddress   String?
    userAgent   String?
    createdAt   DateTime @default(now())
    
    @@index([userId, createdAt])
    @@index([entityType, entityId])
  }
  ```

### Implementation Notes

- Use middleware to auto-log all mutations
- Immutable records (no update/delete endpoints)
- Admin-only read access

---

## Feature 5: Client Status & Lead Origin Tracking

### Description

Categorize clients by status (Lead Cold, VIP, Referral, Contacted) and track lead origin.

### Technical Implementation

- **Frontend Components:**
  - `ClientStatusBadge.tsx` - Visual status indicator
  - `StatusSelector.tsx` - Dropdown to change status
  - `LeadOriginTracker.tsx` - Track and display lead source
  
- **Backend:**
  - Status transition validation
  - Lead source analytics
  
- **Database Schema:**

  ```prisma
  model Client {
    id          String       @id @default(cuid())
    name        String
    email       String       @unique
    phone       String?
    status      ClientStatus @default(LEAD_COLD)
    leadOrigin  LeadOrigin   @default(DIRECT)
    preferences Json?
    createdAt   DateTime     @default(now())
    updatedAt   DateTime     @updatedAt
  }

  enum ClientStatus {
    LEAD_COLD
    LEAD_WARM
    CONTACTED
    QUALIFIED
    VIP
    REFERRAL
    CONVERTED
    LOST
  }

  enum LeadOrigin {
    DIRECT
    REFERRAL
    WEBSITE
    SOCIAL_MEDIA
    ADVERTISEMENT
    EVENT
    PARTNER
    OTHER
  }
  ```

---

## Feature 6: Enhanced Client Profile

### Description

Comprehensive client profile with personal information and property preferences for matching.

### Technical Implementation

- **Frontend Components:**
  - `ClientProfileForm.tsx` - Comprehensive profile editor
  - `PreferenceBuilder.tsx` - Build property search criteria
  - `MatchingResults.tsx` - Show matched properties
  
- **Backend:**
  - Client profile service
  - Property matching algorithm (as per CLIENT_PROPERTY_MATCHING.md)
  
- **Database Schema:**

  ```prisma
  model Client {
    id              String    @id @default(cuid())
    name            String
    email           String    @unique
    phone           String?
    dateOfBirth     DateTime?
    address         String?
    status          ClientStatus
    leadOrigin      LeadOrigin
    
    // Preferences for matching
    budgetMin       Float?
    budgetMax       Float?
    locations       String[]  // Array of preferred locations
    bedroomsMin     Int?
    bathroomsMin    Int?
    propertyType    String?   // apartment, villa, townhouse
    paymentType     String?   // cash, mortgage
    mustHaveFeatures Json?    // balcony, pool, parking
    niceToHaveFeatures Json?  // sea view, high floor, branded
    
    createdAt       DateTime  @default(now())
    updatedAt       DateTime  @updatedAt
  }
  ```

---

## Feature 7: Calendar & Appointments

### Description

Calendar system for tracking real estate projects and client appointments with optional Google Calendar integration.

### Technical Implementation

- **Frontend Components:**
  - `CalendarView.tsx` - Full calendar display
  - `AppointmentForm.tsx` - Create/edit appointments
  - `ProjectTimeline.tsx` - Real estate project milestones
  
- **Backend:**
  - Calendar CRUD API
  - Google Calendar API integration (optional)
  - Reminder/notification service
  
- **Database Schema:**

  ```prisma
  model Appointment {
    id          String   @id @default(cuid())
    title       String
    description String?
    startTime   DateTime
    endTime     DateTime
    type        AppointmentType
    clientId    String?
    propertyId  String?
    agentId     String
    location    String?
    googleEventId String? // For Google Calendar sync
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
  }

  enum AppointmentType {
    CLIENT_MEETING
    PROPERTY_VIEWING
    PROJECT_MILESTONE
    FOLLOW_UP
    OTHER
  }

  model Project {
    id          String   @id @default(cuid())
    name        String
    developer   String
    location    String
    startDate   DateTime?
    completionDate DateTime?
    status      ProjectStatus
    milestones  Json?
  }

  enum ProjectStatus {
    PLANNING
    UNDER_CONSTRUCTION
    NEAR_COMPLETION
    COMPLETED
  }
  ```

### Dependencies

- `react-big-calendar` or `@fullcalendar/react`
- `googleapis` for Google Calendar integration

---

## Feature 8: Reports & Analytics Dashboard

### Description

Comprehensive analytics dashboard with global summaries and breakdowns by agent, client, promoter, and activities.

### Technical Implementation

- **Frontend Components:**
  - `AnalyticsDashboard.tsx` - Main dashboard layout
  - `MetricCard.tsx` - Individual metric display
  - `AgentPerformance.tsx` - Agent-specific analytics
  - `ClientAnalytics.tsx` - Client conversion funnel
  - `ActivityChart.tsx` - Activity trends over time
  
- **Backend:**
  - Analytics aggregation service
  - Report generation API
  - Data export functionality (CSV, PDF)
  
- **Database Schema:**

  ```prisma
  model Analytics {
    id          String   @id @default(cuid())
    date        DateTime
    metric      String   // e.g., "deals_closed", "leads_generated"
    value       Float
    agentId     String?
    metadata    Json?
    createdAt   DateTime @default(now())
    
    @@index([date, metric])
    @@index([agentId, date])
  }
  ```

### Key Metrics

- **Global:**
  - Total properties
  - Active deals
  - Conversion rate
  - Revenue (monthly/yearly)
  
- **By Agent:**
  - Properties assigned
  - Deals closed
  - Client meetings
  - Response time
  
- **By Client:**
  - Status distribution
  - Lead sources
  - Conversion funnel
  
- **By Promoter/Developer:**
  - Properties listed
  - Sales performance
  - Project status

### Dependencies

- `recharts` (already installed)
- `date-fns` for date manipulation

---

## Implementation Priority

### Phase 1 (Core Features)

1. **Client Status & Lead Origin** - Foundation for client management
2. **Enhanced Client Profile** - Required for matching
3. **Activity History** - Essential for audit trail

### Phase 2 (Access & Control)

4. **Admin Access Control** - Security and permissions
2. **Photo Upload System** - Visual content management

### Phase 3 (Advanced Features)

6. **Calendar & Appointments** - Scheduling
2. **Document Generator** - Legal/contract management
3. **Reports & Analytics** - Business intelligence

---

## Database Setup

### Complete Prisma Schema

The complete schema will be created integrating all the models above with proper relations.

### Migration Strategy

1. Create initial schema with all models
2. Run `npx prisma migrate dev --name init`
3. Generate Prisma Client
4. Seed database with sample data

---

## Technical Stack Summary

### Frontend

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Hook Form (for forms)
- Zod (for validation)

### Backend

- Next.js API Routes
- Prisma ORM
- PostgreSQL or SQLite (for development)

### Additional Libraries

- `react-dropzone` - File uploads
- `react-signature-canvas` - E-signatures
- `@react-pdf/renderer` or `pdfkit` - PDF generation
- `react-big-calendar` - Calendar UI
- `googleapis` - Google Calendar integration
- `sharp` - Image processing
- `date-fns` - Date utilities

---

## Next Steps

1. Review and approve this plan
2. Set up complete Prisma schema
3. Implement features in priority order
4. Test each feature thoroughly
5. Deploy incrementally

---

## Notes

- All features follow the existing design system (clean, minimal, premium)
- Mock data will be used initially
- Backend integration can be added incrementally
- Focus on UI/UX first, then add real data

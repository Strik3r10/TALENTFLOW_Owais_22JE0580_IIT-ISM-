# ⚔️ TalentFlow - Medieval Recruitment Platform 🏰

A medieval-themed React application for Royal Recruiters to manage military quests, warriors, and training trials. Built with a castle-inspired design featuring parchment scrolls, wax seals, and medieval aesthetics.

## 🎨 Theme Overview

TalentFlow transforms modern hiring into a medieval adventure:
- **Jobs** → **Quests** (Military campaigns needing warriors)
- **Candidates** → **Knights/Warriors** (Brave recruits seeking glory)
- **HR Team** → **Royal Recruiters** (Kingdom's talent scouts)
- **Assessments** → **Training Trials** (Tests of valor and skill)
- **Application Stages** → **Warrior Ranks** (Recruit → Squire → Knight)

## ✨ Features

### 🏰 Castle Hall (Landing Page)
- **Hero Section**: Castle entrance with torch animations
- **Live Statistics**: Total quests, active campaigns, recruits, and recruited knights
- **Feature Highlights**: Quest management, warrior registry, and war room strategy
- **Medieval Design**: Parchment backgrounds, wax seal buttons, and gold trim accents

### 📜 Quest Board (Jobs Management)
- **Parchment Cards**: Medieval-styled job listings with torn edges
- **Quest Creation**: Post new quests with requirements and skill tags
- **Drag & Drop**: Reorder quests with optimistic updates
- **Status Management**: Active campaigns vs. ancient scrolls (archived)
- **Deep Links**: `/jobs/:jobId` for specific quest details
- **Validation**: Required fields and unique quest names

### 🛡️ Royal Registry (Candidates Management)
- **Virtualized List**: Efficiently handle 1000+ warrior records
- **Advanced Search**: Find warriors by name and email
- **Stage Filtering**: Filter by rank (Applied, Screening, Combat Trial, etc.)
- **Warrior Timeline**: Track journey from recruit to elite knight
- **Commander's Notes**: Add remarks on warrior performance
- **Medieval Names**: Authentic medieval character names (Arthur, Guinevere, etc.)

### ⚔️ War Room (Kanban Pipeline)
- **Strategy Board**: Six columns representing warrior progression stages
  - 🛡️ Applied Recruits
  - ⚔️ Initial Screening
  - 🗡️ Combat Trials
  - 📜 Royal Offer
  - 👑 Recruited Knights
  - ⚠️ Declined
- **Drag & Drop**: Move warriors between ranks
- **Visual Indicators**: Castle tower columns with medieval color schemes
- **Real-time Updates**: Instant state synchronization with rollback on failure

### 🎯 Training Trials (Assessments)
- **Trial Builder**: Create job-specific warrior assessments
- **Question Types**: 
  - Single choice (e.g., "Years of military service")
  - Multiple choice (e.g., "Weapons mastered")
  - Short/Long text (e.g., "Describe your valor")
  - Numeric (e.g., "Rate strategic abilities 1-10")
- **Live Preview**: See trials as warriors would experience them
- **Medieval Context**: Honor & valor questions, battle achievements, tactical scenarios

## 🎨 Design System

### Color Palette
```css
Castle Stone: #3a3a3a (Dark gray for text)
Parchment: #f4e8c1 (Aged paper background)
Royal Purple: #6a0dad (Accent for important elements)
Gold: #d4af37 (Highlights, buttons, borders)
Blood Red: #8b0000 (Wax seals, danger states)
Forest Green: #2d5016 (Success states)
Aged Brown: #5c4033 (Borders, secondary text)
```

### Typography
- **Headers**: Cinzel (Medieval serif)
- **Body**: Crimson Text (Readable serif)
- **Decorative**: UnifrakturMaguntia (Gothic blackletter)

### Custom Components
- **ParchmentCard**: Aged paper with torn edges
- **WaxSealButton**: Circular buttons with embossed effect
- **ScrollModal**: Unfurling scroll animation
- **TorchLoader**: Flickering torch spinner
- **Badge**: Medieval-styled status indicators

### Animations
- **Scroll Unfurl**: Modals appear like unrolling parchment
- **Torch Flicker**: Loading states with animated flames
- **Gold Glow**: Hover effects on interactive elements
- **Sword Slash**: Success animations
- **Shield Break**: Error animations

## 🛠️ Technical Architecture

### Frontend Stack
- **React 19** with TypeScript
- **React Router 7** for navigation
- **Tailwind CSS 3.4** with custom medieval theme
- **dnd-kit** for drag-and-drop functionality
- **React Window** for virtualized lists
- **React Hook Form** for form validation
- **Lucide React** for icons (customized with medieval emojis)

### Data Layer
- **Dexie.js** (IndexedDB wrapper)
- **MSW 2.11** (Mock Service Worker for API simulation)
- **Local-first persistence** with write-through caching
- **Optimistic updates** with automatic rollback

### Database Schema
```typescript
Jobs: id, title, slug, status, tags, order, description, requirements
Candidates: id, name, email, stage, jobId, appliedAt, notes
CandidateTimeline: id, candidateId, stage, timestamp, note
Assessments: id, jobId, title, sections[], questions[]
AssessmentResponses: id, assessmentId, candidateId, responses
```

### API Simulation
- **Artificial Latency**: 200-1200ms delays
- **Error Rate**: 5-10% on write operations
- **Endpoints**:
  - `GET/POST/PATCH /api/jobs`
  - `PATCH /api/jobs/:id/reorder`
  - `GET/POST/PATCH /api/candidates`
  - `GET /api/candidates/:id/timeline`
  - `GET/PUT /api/assessments/:jobId`

## 📦 Seed Data

### 25 Medieval Quests
- Elite Castle Guard, Royal Knight Commander, Master Siege Engineer
- Dragon Slayer Champion, Cavalry Squadron Leader, etc.

### 1000+ Warriors with Medieval Names
- First Names: Arthur, Guinevere, Lancelot, Roland, Morgana, Cedric...
- Last Names: Ironforge, Stormrider, Blackthorn, Silverhelm, Dragonbane...

### 30+ Skill Tags
- Swordsmanship, Archery, Horsemanship, Strategy, Leadership
- Combat, Defense, Siege, Reconnaissance, Tactics, etc.

### 3 Pre-built Training Trials
- Combat Proficiency Assessment
- Honor & Valor Evaluation
- Strategic Warfare Analysis

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.tsx              # Medieval navigation and castle sidebar
│   ├── JobModal.tsx            # Quest creation/editing scroll modal
│   └── ui/                     # Reusable medieval UI components
│       ├── ParchmentCard.tsx   # Aged paper cards
│       ├── WaxSealButton.tsx   # Medieval-styled buttons
│       ├── ScrollModal.tsx     # Unfurling scroll modals
│       ├── TorchLoader.tsx     # Flickering torch spinner
│       ├── Badge.tsx           # Status badges
│       ├── Input.tsx           # Themed input fields
│       └── Select.tsx          # Themed select dropdowns
├── pages/
│   ├── LandingPage.tsx         # Castle Hall entrance
│   ├── JobsBoard.tsx           # Quest Board (jobs list)
│   ├── JobDetail.tsx           # Individual quest details
│   ├── KanbanBoard.tsx         # War Room (pipeline)
│   ├── CandidatesList.tsx      # Royal Registry
│   ├── CandidateDetail.tsx     # Warrior profile
│   └── AssessmentBuilder.tsx   # Training Trials builder
├── mocks/
│   ├── handlers.ts             # MSW request handlers
│   └── browser.ts              # Service worker setup
├── database.ts                 # Dexie schema and types
├── seedData.ts                 # Medieval-themed seed data
├── index.css                   # Medieval theme styles
├── tailwind.config.js          # Custom medieval colors & animations
└── App.tsx                     # Main app with routing
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd talentflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   The app will automatically open at `http://localhost:3001`

4. **Initial Data**
   - Database seeds automatically on first load
   - 25 medieval quests
   - 1000 warriors with medieval names
   - 3 pre-built training trials

### Build for Production

```bash
npm run build
```

The optimized build will be in the `build/` directory.

## 🎮 Usage Guide

### Quest Management (Jobs)
1. **View Quests**: Click "Quest Board" in the castle sidebar
2. **Post Quest**: Click "Post New Quest" button
3. **Edit Quest**: Click edit icon (✏️) on any quest scroll
4. **Archive Quest**: Click archive icon to move to ancient scrolls
5. **Reorder Quests**: Drag and drop quests using grip handles
6. **Search**: Use search bar to find quests by title or skills

### Warrior Management (Candidates)
1. **View Warriors**: Click "Royal Registry" in sidebar
2. **Search Warriors**: Type name or email in search banner
3. **Filter by Rank**: Use dropdown to filter by application stage
4. **View Profile**: Click warrior name to see achievement scroll
5. **Add Notes**: Record commander's remarks on warrior performance

### War Room (Pipeline)
1. **Access War Room**: Click "War Room" in sidebar
2. **View Columns**: See six stages from recruit to knight
3. **Move Warriors**: Drag warrior cards between rank columns
4. **Track Progress**: Monitor distribution across stages
5. **Automatic Updates**: Changes sync to database instantly

### Training Trials (Assessments)
1. **Create Trial**: Go to quest details, click "Assessment"
2. **Add Sections**: Organize questions into categories
3. **Add Questions**: Choose from 6 question types
4. **Preview**: See how warriors will experience the trial
5. **Save**: All changes persist to local database

## 🎯 Key Features Implemented

### ✅ Core Requirements Met
- [x] Jobs CRUD with pagination & filtering
- [x] Drag-and-drop reordering with optimistic updates
- [x] 1000+ candidates with virtualized list
- [x] Client-side search and server-like filtering
- [x] Kanban board for candidate progression
- [x] Candidate timeline and status tracking
- [x] Assessment builder with 6 question types
- [x] Live preview pane for assessments
- [x] Conditional question logic
- [x] Validation rules (required, ranges, length)
- [x] MSW for API simulation
- [x] IndexedDB for local persistence
- [x] Artificial latency (200-1200ms)
- [x] 5-10% error rate with rollback

### 🎨 Bonus Features Added
- [x] **Medieval Theme**: Complete visual overhaul
- [x] **Landing Page**: Castle entrance with stats
- [x] **Custom Animations**: Scroll unfurl, torch flicker, gold glow
- [x] **Medieval Typography**: Cinzel, Crimson Text fonts
- [x] **Themed Components**: Parchment, wax seals, torn edges
- [x] **Medieval Seed Data**: 1000 warriors with authentic names
- [x] **Responsive Design**: Mobile-first castle layout
- [x] **404 Handling**: Lost in the forest theme
- [x] **Toast Notifications**: Medieval banner style

## 🏗️ Architecture Decisions

### Why Medieval Theme?
- **Memorable UX**: Stands out from typical corporate hiring platforms
- **Cohesive Design**: Every element reinforces the theme
- **Engaging**: Makes tedious HR tasks feel like a quest
- **Demonstrates Creativity**: Shows design thinking beyond requirements

### State Management
- **Local State (useState)**: For component-specific UI state
- **IndexedDB (Dexie)**: For persistent data storage
- **No Redux**: Kept simple with React's built-in capabilities
- **Optimistic Updates**: Immediate UI feedback with automatic rollback

### Component Architecture
- **Reusable UI Kit**: All medieval components in `components/ui/`
- **Page Components**: Feature-specific containers
- **Composition**: Small, focused components
- **TypeScript**: Full type safety throughout

### Performance Optimizations
- **React Window**: Virtualizes 1000+ candidate list
- **Code Splitting**: Routes loaded on demand
- **Memoization**: React.memo for expensive renders
- **Debounced Search**: Prevents excessive filtering

## 🐛 Known Issues & Limitations

### Current Limitations
- No backend: All data is local-only
- No authentication: Single user assumed
- No real-time collaboration
- Browser-specific: Data doesn't sync across devices
- No file uploads: File upload questions are stubs

### Future Enhancements
- [ ] Add sound effects (sword clinks, parchment rustle)
- [ ] Dark mode (night castle theme)
- [ ] Export data as JSON/CSV
- [ ] Print-friendly warrior profiles
- [ ] Keyboard shortcuts for power users
- [ ] Undo/redo functionality
- [ ] Bulk operations on warriors
- [ ] Advanced analytics dashboard
- [ ] Email notifications (mock)

## 📝 Technical Decisions Log

### MSW vs Mirage
**Chosen**: MSW
**Reason**: Better TypeScript support, more modern, browser-native Service Worker

### State Management
**Chosen**: React Context + Local State
**Reason**: Application complexity doesn't justify Redux overhead

### Styling
**Chosen**: Tailwind CSS with custom theme
**Reason**: Rapid development, consistent design system, easy medieval customization

### Virtualization
**Chosen**: react-window
**Reason**: Lightweight, performant, sufficient for our needs

### Forms
**Chosen**: React Hook Form
**Reason**: Minimal re-renders, great DX, built-in validation

## 🙏 Acknowledgments

- Medieval fonts from Google Fonts
- Icons from Lucide React
- Inspiration from medieval manuscripts and castle architecture

### Job
```typescript
interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  description?: string;
  requirements?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Candidate
```typescript
interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  jobId: string;
  appliedAt: Date;
  updatedAt: Date;
  notes?: string;
}
```

### Assessment
```typescript
interface Assessment {
  id: string;
  jobId: string;
  title: string;
  sections: AssessmentSection[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Technical Decisions

### State Management
- **Local State**: React hooks for component-level state
- **Server State**: Direct API calls with MSW mocking
- **Persistence**: IndexedDB with Dexie for offline capability

### Performance Optimizations
- **Virtualization**: React Window for large candidate lists
- **Lazy Loading**: Route-based code splitting
- **Optimistic Updates**: Immediate UI feedback with error handling

### Error Handling
- **Network Errors**: Simulated 5-10% error rate on write operations
- **Validation**: Client-side form validation with error messages
- **Rollback**: Automatic state restoration on failed operations

### Accessibility
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG compliant color schemes

## Deployment

The application can be deployed to any static hosting service:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting service

3. **Configure routing** for client-side routing support

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
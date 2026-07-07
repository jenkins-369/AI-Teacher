# AI Teacher

A production-grade AI-powered learning platform built with Next.js, Prisma, and Google Gemini API.

## Features

- **Course Management**: Create, read, update, delete courses
- **Study Materials**: Upload and manage learning content
- **RAG Chat**: AI-powered chat with document context
- **AI Generation**: Generate summaries, flashcards, and quizzes from content
- **Quiz System**: Multiple choice quizzes with scoring
- **Progress Tracking**: Monitor learning progress and completion

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes, Prisma
- **Database**: Supabase PostgreSQL
- **AI**: Google Gemini API (JSON schema support)

## Project Structure

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── courses/           # CRUD: GET, POST, PUT, DELETE
│   │   ├── study-materials/   # CRUD: GET, POST, PUT, DELETE
│   │   ├── quizzes/           # GET, POST with questions
│   │   ├── flashcards/        # GET, POST
│   │   ├── chat/              # RAG-based AI chat
│   │   ├── progress/          # Progress tracking
│   │   ├── assignments/       # Assignment management
│   │   └── generate/          # AI generation endpoints
│   ├── courses/              # Course pages
│   ├── materials/            # Material pages
│   ├── quizzes/              # Quiz pages
│   ├── flashcards/           # Flashcard pages
│   ├── chat/                 # Chat pages
│   ├── assignments/          # Assignment pages
│   └── progress/             # Progress pages
├── components/
│   ├── ui/                   # Reusable: Button, Card, Input, Modal, Alert
│   ├── course/              # CourseForm, CourseList
│   ├── quiz/                # QuizTaker
│   ├── flashcard/           # FlashcardViewer
│   ├── chat/                # ChatInterface
│   └── study-material/      # StudyMaterialManager
├── context/
│   └── AppContext.js        # Global state management
└── services/
    └── api.js               # API service layer
```

## Backend API Documentation

### Courses

#### GET `/api/courses`
Returns all courses with nested study materials and assignments.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Math 101",
    "description": "Introduction to Mathematics",
    "category": "Science",
    "difficulty": "medium",
    "created_at": "2025-01-15T10:30:00Z",
    "studyMaterials": [...],
    "assignments": [...]
  }
]
```

#### POST `/api/courses`
Creates a new course.

**Request Body:**
```json
{
  "title": "Math 101",
  "description": "Introduction to Mathematics",
  "category": "Science",
  "difficulty": "medium"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "title": "Math 101",
  "description": "Introduction to Mathematics",
  "category": "Science",
  "difficulty": "medium",
  "created_at": "2025-01-15T10:30:00Z"
}
```

#### GET `/api/courses/[id]`
Returns a single course with all related data.

#### PUT `/api/courses/[id]`
Updates a course.

**Request Body:** Same as POST, all fields optional.

#### DELETE `/api/courses/[id]`
Deletes a course and all related data (cascades to study materials, quizzes, etc.).

---

### Study Materials

#### GET `/api/study-materials`
Returns all materials with nested relations (course, chunks, summaries, flashcards, quizzes).

#### POST `/api/study-materials`
Creates a study material.

**Request Body:**
```json
{
  "course_id": 1,
  "title": "Chapter 1 Notes",
  "file_url": "https://...",
  "file_type": "pdf",
  "pages": 25
}
```

#### GET `/api/study-materials/[id]`
Returns a single material with all relations including document chunks and generated content.

#### PUT `/api/study-materials/[id]`
Updates a material's metadata.

**Request Body:**
```json
{
  "title": "Updated Title",
  "file_url": "https://...",
  "file_type": "pdf",
  "pages": 30
}
```

#### DELETE `/api/study-materials/[id]`
Deletes material and all dependent records (document chunks, summaries, flashcards, quizzes, chat history).

---

### Document Chunks (RAG)

#### GET `/api/document-chunks?material_id=1`
Returns all chunks for a specific material.

#### POST `/api/document-chunks`
Stores text chunks for RAG processing.

**Request Body:**
```json
{
  "material_id": 1,
  "chunks": [
    { "text": "Chunk content...", "page_number": 1 },
    { "text": "Another chunk...", "page_number": 2 }
  ]
}
```

All chunks are stored in a single transaction for performance.

---

### AI Generation

#### POST `/api/generate/summary`
Generates an AI summary from document chunks.

**Request Body:**
```json
{ "material_id": 1 }
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "material_id": 1,
  "summary": "Generated summary text...",
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Note:** Requires document chunks to exist. Returns 400 if no content available.

#### POST `/api/generate/flashcards`
Generates flashcards from document content.

**Request Body:**
```json
{ "material_id": 1, "count": 10 }
```

**Response:** `201 Created`
```json
[
  {
    "id": 1,
    "material_id": 1,
    "question": "What is...? ",
    "answer": "The answer is...",
    "difficulty": "medium"
  }
]
```

#### POST `/api/generate/quiz`
Generates a multiple-choice quiz.

**Request Body:**
```json
{ "material_id": 1, "count": 5 }
```

**Response:** `201 Created`
```json
{
  "quiz": { "id": 1, "material_id": 1, "title": "Quiz: Chapter 1" },
  "questions": [
    {
      "id": 1,
      "quiz_id": 1,
      "question": "What is...?",
      "option_a": "A",
      "option_b": "B",
      "option_c": "C",
      "option_d": "D",
      "correct_option": "A",
      "explanation": "Explanation..."
    }
  ]
}
```

#### POST `/api/generate/assignment`
Generates assignments from content.

**Request Body:**
```json
{ "material_id": 1, "count": 3 }
```

**Response:** `201 Created` - Array of assignment objects.

---

### Quizzes

#### GET `/api/quizzes`
Returns all quizzes with nested questions and attempts.

#### POST `/api/quizzes`
Creates a quiz shell (questions added separately).

**Request Body:**
```json
{ "material_id": 1, "title": "Quiz Title" }
```

#### GET `/api/quizzes/[id]`
Returns a single quiz with questions and attempts.

#### DELETE `/api/quizzes/[id]`
Deletes a quiz (cascades to questions).

#### POST `/api/quizzes/questions`
Creates quiz questions in bulk.

**Request Body:**
```json
{
  "quiz_id": 1,
  "questions": [
    {
      "question": "Question text?",
      "option_a": "A",
      "option_b": "B",
      "option_c": "C",
      "option_d": "D",
      "correct_option": "A",
      "explanation": "Why A is correct"
    }
  ]
}
```

---

### Quiz Attempts

#### GET `/api/quiz-attempts`
Lists all quiz attempts with nested quiz and course data.

#### POST `/api/quiz-attempts`
Records a quiz attempt.

**Request Body:**
```json
{
  "quiz_id": 1,
  "course_id": 1,
  "score": 4,
  "total_questions": 5
}
```

---

### Flashcards

#### GET `/api/flashcards?material_id=1`
Returns flashcards (optionally filtered by material).

#### POST `/api/flashcards`
Creates flashcards. Accepts either bulk array or single object.

**Request Body (bulk):**
```json
{
  "material_id": 1,
  "flashcards": [
    { "question": "Q1", "answer": "A1", "difficulty": "easy" }
  ]
}
```

---

### Chat (RAG)

#### GET `/api/chat?material_id=1`
Returns chat history for a material, ordered by timestamp.

#### POST `/api/chat`
Sends a message to the AI with context from document chunks.

**Request Body:**
```json
{
  "material_id": 1,
  "user_message": "Explain this concept..."
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "material_id": 1,
  "user_message": "Explain this concept...",
  "ai_response": "Based on the context...",
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

### Assignments

#### GET `/api/assignments`
Lists all assignments with course data.

#### POST `/api/assignments`
Creates an assignment.

**Request Body:**
```json
{
  "course_id": 1,
  "title": "Homework 1",
  "instructions": "Complete exercises 1-10",
  "due_date": "2025-02-01"
}
```

#### GET `/api/assignments/[id]`
Returns a single assignment.

#### DELETE `/api/assignments/[id]`
Deletes an assignment.

#### POST `/api/assignments/[id]/submit`
Submits an assignment with AI-powered feedback.

**Request Body:**
```json
{ "submission_text": "My answer here..." }
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "assignment_id": 1,
  "submission_text": "My answer here...",
  "ai_feedback": {
    "score": 85,
    "feedback": "Good work on...",
    "suggestions": ["Try...", "Consider..."],
    "strengths": ["Clear explanation...", "Good structure..."]
  },
  "score": 85
}
```

---

### Student Progress

#### GET `/api/progress`
Returns progress with computed completion percentages.

**Response includes:** `completion_percent`, `quiz_attempts`, `avg_score`, etc.

#### POST `/api/progress`
Upserts progress for a course.

**Request Body:**
```json
{ "course_id": 1 }
```

Automatically calculates completion from quiz attempts and assignment submissions.

---

### Dashboard

#### GET `/api/dashboard`
Returns platform statistics.

**Response:**
```json
{
  "courses": 5,
  "materials": 12,
  "chunks": 150,
  "summaries": 8,
  "flashcards": 45,
  "quizzes": 10,
  "questions": 50,
  "attempts": 23,
  "chats": 67,
  "assignments": 8,
  "progress": 5
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Description of the error"
}
```

Common HTTP status codes:
| Status | Description |
|--------|-------------|
| 400 | Bad request (missing/invalid parameters) |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Setup

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Google Gemini API key

### Installation

1. **Install dependencies**
    ```bash
    npm install
    ```

2. **Configure environment** (`.env`)
    ```env
    DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-[YOUR-REGION].pooler.supabase.com:6543/postgres?sslmode=require"
    GEMINI_API_KEY="your-api-key"
    ```

3. **Generate Prisma client**
    ```bash
    npm run prisma:generate
    ```

4. **Push database schema**
    ```bash
    npm run prisma:push
    ```

5. **Run development server**
   ```bash
   npm run dev
   ```

---

## Frontend Documentation

### Service Layer API

```javascript
// Import API modules
import {
  coursesApi,
  studyMaterialsApi,
  documentChunksApi,
  generateApi,
  quizzesApi,
  quizAttemptsApi,
  flashcardsApi,
  chatApi,
  assignmentsApi,
  progressApi,
  dashboardApi
} from '@/services/api'
```

#### Courses API
```javascript
// Get all courses
const courses = await coursesApi.getAll()

// Get single course
const course = await coursesApi.get(id)

// Create course
const course = await coursesApi.create({ title: 'Math 101', description: '...' })

// Update course
const updated = await coursesApi.update(id, { title: 'Math 102' })

// Delete course
await coursesApi.delete(id)
```

#### Study Materials API
```javascript
// Get materials (optionally filter by course)
const materials = await studyMaterialsApi.getAll()

// Get single material with all relations
const material = await studyMaterialsApi.get(id)

// Create material
await studyMaterialsApi.create({
  course_id: 1,
  title: 'Chapter 1',
  file_type: 'pdf',
  pages: 25
})

// Update material
await studyMaterialsApi.update(id, { title: 'Updated' })

// Delete material
await studyMaterialsApi.delete(id)
```

#### Document Chunks API
```javascript
// Get chunks for a material
const chunks = await documentChunksApi.getAll(materialId)

// Create chunks (bulk)
await documentChunksApi.create({
  material_id: 1,
  chunks: [
    { text: 'Content...', page_number: 1 },
    { text: 'More...', page_number: 2 }
  ]
})

// Update chunk
await documentChunksApi.update(id, { chunk_text: 'Updated', page_number: 3 })

// Delete chunk
await documentChunksApi.delete(id)
```

#### AI Generation API
```javascript
// Generate summary
await generateApi.summary(materialId)

// Generate flashcards (count: 1-20, default 10)
await generateApi.flashcards(materialId, 10)

// Generate quiz (count: 1-20, default 5)
await generateApi.quiz(materialId, 5)

// Generate assignments (count: 1-10, default 3)
await generateApi.assignment(materialId, 3)
```

#### Quizzes API
```javascript
const quizzes = await quizzesApi.getAll()
const quiz = await quizzesApi.get(id)
const quiz = await quizzesApi.create({ material_id: 1, title: 'Quiz 1' })
await quizzesApi.delete(id)
await quizzesApi.createQuestions({ quiz_id: 1, questions: [...] })
```

#### Quiz Attempts API
```javascript
await quizAttemptsApi.getAll()
await quizAttemptsApi.create({ quiz_id: 1, course_id: 1, score: 4, total_questions: 5 })
```

#### Flashcards API
```javascript
await flashcardsApi.getAll(materialId)
await flashcardsApi.create({ material_id: 1, question: 'Q', answer: 'A' })
await flashcardsApi.update(id, { question: 'Updated Q' })
await flashcardsApi.delete(id)
```

#### Chat API
```javascript
await chatApi.getAll(materialId)
await chatApi.sendMessage({ material_id: 1, user_message: 'Question?' })
```

#### Assignments API
```javascript
await assignmentsApi.getAll()
await assignmentsApi.get(id)
await assignmentsApi.delete(id)
await assignmentsApi.submit(id, { submission_text: 'My answer' })
```

#### Progress API
```javascript
await progressApi.getAll()
await progressApi.get(id)
await progressApi.upsert({ course_id: 1 })
await progressApi.delete(id)
```

#### Dashboard API
```javascript
const stats = await dashboardApi.getStats()
```

---

### Context API

The `src/context/AppContext.js` provides global state management:

```javascript
'use client'
import { useAppContext } from '@/context/AppContext'

function MyComponent() {
  const {
    courses,
    progress,
    loading,
    selectedCourse,
    setSelectedCourse,
    addCourse,
    updateCourse,
    deleteCourse,
    refreshData
  } = useAppContext()
}
```

**Available Properties:**
| Property | Type | Description |
|----------|------|-------------|
| `courses` | `Array` | All courses from server |
| `progress` | `Array` | Student progress records |
| `loading` | `boolean` | Loading state |
| `selectedCourse` | `Object` | Currently selected course |
| `setSelectedCourse` | `Function` | Set selected course |
| `addCourse` | `Function` | Create and add course |
| `updateCourse` | `Function` | Update course |
| `deleteCourse` | `Function` | Delete course |
| `refreshData` | `Function` | Re-fetch all data |

---

### UI Components

All components are in `src/components/ui/index.js` and use TailwindCSS with consistent styling patterns.

#### Card
```jsx
import { Card } from '@/components/ui'

<Card className="max-w-lg">
  <h3>Content</h3>
</Card>
```

#### Button
```jsx
import { Button } from '@/components/ui'

<Button onClick={handleClick}>Primary</Button>
<Button variant="secondary" onClick={handleCancel}>Secondary</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
<Button disabled={loading}>Disabled</Button>
```

**Variants:** `primary`, `secondary`, `danger`

#### Input
```jsx
import { Input } from '@/components/ui'

<Input
  label="Title"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  required
/>
<Input
  label="Pages"
  type="number"
  value={pages}
  onChange={(e) => setPages(e.target.value)}
/>
```

#### TextArea
```jsx
import { TextArea } from '@/components/ui'

<TextArea
  label="Description"
  value={desc}
  onChange={(e) => setDesc(e.target.value)}
  rows={6}
/>
```

#### Select
```jsx
import { Select } from '@/components/ui'

const options = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' }
]

<Select
  label="Difficulty"
  value={difficulty}
  onChange={(e) => setDifficulty(e.target.value)}
  options={options}
/>
```

#### Modal
```jsx
import { Modal } from '@/components/ui'

<Modal
  isOpen={showModal}
  title="Edit Item"
  onClose={() => setShowModal(false)}
>
  <p>Modal content</p>
</Modal>
```

#### LoadingSpinner
```jsx
import { LoadingSpinner } from '@/components/ui'

{loading && <LoadingSpinner />}
```

#### Alert
```jsx
import { Alert } from '@/components/ui'

<Alert
  message="Operation failed"
  type="error"
  onClose={() => setError(null)}
/>
```

**Types:** `info`, `success`, `error`

---

### Component Usage Patterns

#### StudyMaterialManager
```jsx
import StudyMaterialManager from '@/components/study-material/StudyMaterialManager'

// In a course page
<StudyMaterialManager
  courseId={course.id}
  fetchCourse={refetchCourse}
/>
```

Features:
- CRUD for study materials
- Bulk chunk management
- AI generation buttons (summary, flashcards, quiz, assignment)
- Inline chunk editing

---

### AI Integration

The `src/lib/gemini.js` module handles Google Gemini API interactions:

```javascript
import { generateContent, generateJson } from '@/lib/gemini'
```

#### Text Generation
```javascript
const text = await generateContent(prompt, { maxOutputTokens: 1000 })
```

#### JSON Generation with Schema
```javascript
import { QuizSchema } from '@/lib/schemas'

const result = await generateJson(prompt, QuizSchema)
// Returns: { questions: [{ question, option_a, ..., correct_option }] }
```

---

### Available Schemas

Defined in `src/lib/schemas.js` for structured AI output:

```javascript
// FlashcardSchema - generates flashcards with question, answer, difficulty
// QuizSchema - generates MCQs with 4 options, correct answer, explanation
// SummarySchema - generates plain text summary
// AssignmentSchema - generates assignments with title, instructions, due_date
// AssignmentFeedbackSchema - generates score, feedback, suggestions, strengths
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `GEMINI_API_KEY` | Google Gemini API key |

---

## Deployment

```bash
npm run build
npm run start
```

---

## Database Schema

The schema includes 12 models with proper relations and cascade deletes.
- Courses ↔ StudyMaterials (1:N)
- StudyMaterials ↔ Quizzes (1:N)
- Quizzes ↔ QuizQuestions (1:N)
- Courses ↔ Assignments (1:N)
- Courses ↔ QuizAttempts (1:N)
- Courses ↔ StudentProgress (1:1)
- StudyMaterials ↔ DocumentChunks (1:N)
- StudyMaterials ↔ AiSummaries (1:N)
- StudyMaterials ↔ Flashcards (1:N)
- StudyMaterials ↔ ChatHistory (1:N)
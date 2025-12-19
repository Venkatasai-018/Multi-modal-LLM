# NotebookLLM-Style React Frontend

A modern, NotebookLLM-inspired interface for the Multi-modal RAG system built with React.

## Features

- 📚 **Two-Panel Layout**: Documents library sidebar + chat interface
- 📤 **Drag & Drop Upload**: Upload multiple files at once
- 💬 **Chat Interface**: Google-style question/answer bubbles
- 🕒 **History Panel**: Click previous queries to view them
- 📊 **Live Stats**: Document and query counts
- 🎨 **Modern Design**: Clean Google Material-inspired UI

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Usage

1. Make sure backend is running on `http://localhost:8000`
2. Start the React app: `npm start`
3. Open `http://localhost:3000` in your browser
4. Upload documents using drag-and-drop or file browser
5. Ask questions in the chat interface
6. Click history items to view past conversations

## Technologies

- React 18.2.0
- Modern CSS3 with animations
- Fetch API with CORS support
- Responsive design

## Features Overview

### Left Sidebar
- Stats dashboard (documents/queries count)
- Upload area with drag-and-drop
- Documents list with status badges
- Recent queries (last 10)

### Main Content
- Welcome message for first-time users
- Chat-style message bubbles
- Source citations with similarity scores
- Auto-scrolling to latest message
- Loading indicators

### Interactions
- Enter to send (Shift+Enter for new line)
- Click history to load conversations
- Real-time upload progress
- Disabled state during processing

## Configuration

API endpoint is configured in `App.js`:
```javascript
const API_URL = 'http://localhost:8000';
```

Change this if your backend runs on a different port.

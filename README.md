# 🚀 DevSpace

💻 MERN Stack Project Documentation

---

## 1. 📌 Project Overview

**DevSpace** is a web application that allows developers to collaborate on projects, manage tasks, communicate with team members, and get AI assistance for code explanations and debugging.

The platform combines features inspired by GitHub, Trello, and ChatGPT in a single workspace.

Users can create projects, invite team members, assign tasks, communicate through project chats, and use AI tools to analyze and improve code.

---

## 2. 🎯 Objectives

The main objectives of the project are:

- Provide a collaboration platform for development teams
- Enable project and task management
- Allow team communication
- Integrate AI assistance for code understanding
- Demonstrate full-stack development using MERN stack

---

## 3. 🛠️ Technology Stack

### 🎨 Frontend
- React.js
- Redux Toolkit (State Management)
- Tailwind CSS (UI Styling)

### ⚙️ Backend
- Node.js
- Express.js

### 🗄️ Database
- MongoDB

### 🤖 AI Integration
- OpenAI API / Gemini API

### 💾 Storage
- Browser Local Storage (for login session)

---

## 4. 🏗️ System Architecture

The application follows a client-server architecture.

```text
User (Browser)
	↓
React Frontend
	↓
Express API Server
	↓
MongoDB Database
```

### 🔄 Workflow

1. User interacts with the React frontend.
2. Frontend sends API requests to the backend.
3. Backend processes requests using Express.
4. Data is stored or retrieved from MongoDB.
5. Backend returns response to frontend.

---

## 5. ✨ Features

### 5.1 🔐 User Authentication

Users can register and login to the system.

**Features**
- User registration
- User login
- Session storage using Local Storage
- Logout functionality

**Process**
1. User registers with name, email, and password.
2. Backend stores user in MongoDB.
3. User logs in with credentials.
4. Frontend stores user data in Local Storage.

---

### 5.2 📁 Project Management

Users can create and manage development projects.

**Features**
- Create new project
- View project list
- Add project members
- View project details

**Example Project Data**

```text
Project
- id
- name
- owner
- members
- createdAt
```

---

### 5.3 📋 Task Management (Kanban Board)

Tasks help teams organize work.

**Features**
- Create tasks
- Assign tasks to members
- Update task status
- Track deadlines

**Task Status**
- To Do
- In Progress
- Completed

**Example Task**

```text
Task
- title
- description
- status
- assignedTo
- deadline
```

---

### 5.4 💬 Project Chat

Each project has a chat system for team communication.

**Features**
- Send messages
- View conversation history
- Project-specific chat

**Message Data**

```text
Message
- sender
- projectId
- message
- timestamp
```

---

### 5.5 🧠 AI Code Assistant

The system includes an AI assistant that helps developers analyze code.

**Features**
- Explain code
- Suggest improvements
- Detect possible bugs

**Example Request**

User input: **"Explain this function"**

Backend sends request to OpenAI / Gemini API and returns response.

---

### 5.6 📊 Dashboard

The dashboard provides an overview of project activity.

**Displays**
- Total projects
- Total tasks
- Completed tasks
- Pending tasks

Charts can be used to visualize task distribution.

---

## 6. 🧱 Database Design

The system uses MongoDB with the following collections.

### Users Collection

```text
User
_id
name
email
password
projects[]
createdAt
```

### Projects Collection

```text
Project
_id
name
owner
members[]
createdAt
```

### Tasks Collection

```text
Task
_id
title
description
status
assignedTo
deadline
projectId
```

### Messages Collection

```text
Message
_id
projectId
sender
message
timestamp
```

---

## 7. 🔌 API Endpoints

### Authentication
- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`

### Projects
- **Create Project**: `POST /api/projects`
- **Get Projects**: `GET /api/projects`

### Tasks
- **Create Task**: `POST /api/tasks`
- **Get Tasks**: `GET /api/tasks/:projectId`

### Messages
- **Send Message**: `POST /api/messages`
- **Get Messages**: `GET /api/messages/:projectId`

### AI Assistant
- `POST /api/ai/explain`

---

## 8. 📂 Project Folder Structure

### 🖥️ Frontend

```text
client
│
├── src
│   ├── components
│   ├── pages
│   ├── redux
│   ├── services
│   ├── utils
│   └── App.jsx
```

### 🧩 Backend

```text
server
│
├── controllers
├── routes
├── models
├── middleware
├── config
└── server.js
```

---

## 9. 🔒 Security Considerations

Current authentication uses Local Storage.

**Limitations**
- Not fully secure
- Can be modified by users

**Future improvements**
- JWT Authentication
- HTTP-only cookies
- Role-based access control

---

## 10. 🚧 Future Enhancements

Possible improvements include:

- Real-time chat using Socket.io
- Collaborative code editor
- GitHub repository integration
- File sharing
- Email notifications
- Role-based project permissions

---

## 11. ✅ Conclusion

DevSpace demonstrates the implementation of a full-stack application using the MERN stack.

The system integrates project management, team communication, and AI assistance into a single platform. It showcases skills in frontend development, backend API design, database management, and third-party API integration.

This project serves as a strong demonstration of modern web development practices and full-stack architecture.
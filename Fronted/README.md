# NearTalk Frontend

A modern, real-time chat application that connects you with people nearby. Built with React, Vite, Tailwind CSS, and Socket.IO.

## Features

### User Features
- **Authentication**: Register, login, JWT-based auth with secure password handling
- **Location-Based Discovery**: Find people within 5 KM radius
- **Real-Time Chat**: Instant messaging with Socket.IO
- **Random Stranger Matching**: Get paired with random nearby users
- **User Profiles**: Customizable profiles with bio and interests
- **Block & Report**: Safety features to manage interactions
- **Dark Mode**: Modern dark-themed interface
- **Responsive Design**: Works on desktop, tablet, and mobile

### Admin Features
- **Dashboard**: Overview of platform statistics
- **User Management**: View, search, suspend, and reactivate users
- **Report Management**: Review and resolve user reports
- **Analytics**: Detailed charts and statistics
- **Platform Settings**: Configure app behavior

## Tech Stack

- **React 18** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router v6** - Navigation
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP Client
- **Recharts** - Data Visualization
- **React Hot Toast** - Notifications
- **Date-fns** - Date formatting
- **Emoji Picker React** - Emoji support

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend server running (see backend README)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd neartalk/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your backend URL:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AdminRoute.jsx
│   │   ├── Avatar.jsx
│   │   ├── ChatBox.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── ConversationItem.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Footer.jsx
│   │   ├── Loader.jsx
│   │   ├── Message.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   ├── OnlineUsersList.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── ReportModal.jsx
│   │   ├── SkeletonCard.jsx
│   │   └── UserCard.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ChatContext.jsx
│   │   └── SocketContext.jsx
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   ├── useInfiniteScroll.js
│   │   └── useLocation.js
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminAnalytics.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminReports.jsx
│   │   │   ├── AdminSettings.jsx
│   │   │   ├── AdminSuspendedUsers.jsx
│   │   │   └── AdminUsers.jsx
│   │   ├── Chat.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Nearby.jsx
│   │   ├── NotFound.jsx
│   │   ├── Profile.jsx
│   │   ├── RandomChat.jsx
│   │   ├── Register.jsx
│   │   └── Settings.jsx
│   ├── services/
│   │   ├── adminService.js
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── chatService.js
│   │   └── userService.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## API Integration

The frontend expects the following API endpoints from the backend:

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `PUT /api/auth/change-password`

### Users
- `GET /api/users/nearby`
- `GET /api/users/:userId`
- `PUT /api/users/profile`
- `PUT /api/users/avatar`
- `PUT /api/users/location`
- `PUT /api/users/settings`

### Chat
- `GET /api/chat/conversations`
- `POST /api/chat/conversations`
- `GET /api/chat/conversations/:id/messages`
- `POST /api/chat/conversations/:id/messages`
- `POST /api/chat/random`
- `POST /api/chat/block/:userId`
- `POST /api/chat/report/:userId`

### Admin
- `GET /api/admin/stats`
- `GET /api/admin/analytics`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/suspend`
- `PUT /api/admin/users/:id/unsuspend`
- `GET /api/admin/reports`
- `PUT /api/admin/reports/:id`

### Socket.IO Events

**Client → Server:**
- `join-room` - Join a conversation room
- `leave-room` - Leave a conversation room
- `typing` - Send typing status

**Server → Client:**
- `new-message` - New message received
- `user-typing` - User typing status
- `online-users` - List of online users
- `user-online` - User came online
- `user-offline` - User went offline

## Color Scheme

| Element | Color |
|---------|-------|
| Primary | `#7C3AED` (Purple) |
| Secondary | `#2563EB` (Blue) |
| Background | `#0F172A` (Dark) |
| Cards | `#1E293B` |
| Text | `#FFFFFF` (White) |
| Online Status | `#22C55E` (Green) |

## Safety Features

- Location coordinates are never exposed to other users
- Only approximate distances are shown
- Block and report functionality
- User-controlled privacy settings
- Admin moderation system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@neartalk.com or open an issue in the repository.
# ✨ Aura Social

> An ethereal, free international friend-making platform with seamless communication, gaming, and language learning.

## 🌟 Features

- **Global Connections** - Connect with friends worldwide, no subscription required
- **Voice & Video Calls** - Crystal clear 1-on-1 and group calls
- **Messaging** - Real-time chat, group chats, and voice messages
- **Gaming** - Play interactive games with friends
- **Language Learning** - Learn languages through conversations and structured lessons
- **User Matching** - AI-powered friend recommendations
- **Aesthetic UI** - Beautiful, minimalist design with glowing effects

## 🏗️ Project Structure

```
aura-social/
├── backend/                  # Node.js + Express API
├── frontend/                 # React Native + Expo
├── docs/                     # Documentation
├── docker-compose.yml        # Docker setup
├── .env.example              # Environment variables template
├── package.json              # Root dependencies
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/imDivu10/aura-social.git
cd aura-social

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start development servers
npm run dev
```

### With Docker

```bash
npm run docker:up
```

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Setup Guide](./docs/SETUP.md)

## 🛠️ Tech Stack

### Frontend
- React Native (Expo)
- Redux for state management
- Socket.io-client for real-time communication
- Agora SDK for video/audio calls

### Backend
- Node.js + Express
- MongoDB for database
- Socket.io for real-time features
- Firebase for notifications
- JWT for authentication

### DevOps
- Docker & Docker Compose
- GitHub Actions for CI/CD

## 📝 License

MIT License - Feel free to use and modify

## 👥 Contributing

Contributions are welcome!

---

**Made with ✨ for connecting the world**

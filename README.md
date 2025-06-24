# Claudio - AI Chatbot

A modern React-based chatbot interface that connects to your RunPod API endpoint using OpenAI-compatible chat completions.

## Features

- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 💬 Real-time chat interface with conversation history
- 🔒 Secure API key management with environment variables
- 📱 Responsive design for desktop and mobile
- ⚡ Built with Vite for fast development and builds
- 🎯 TypeScript for type safety

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/WizKid1968/claudio.git
cd claudio
```

### 2. Install Dependencies

```bash
yarn install
# or
npm install
```

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your RunPod API key:
```env
VITE_API_KEY=your_runpod_api_key_here
```

### 4. Start the Development Server

```bash
yarn dev
# or
npm run dev
```

The application will be available at `http://localhost:5173`

## API Configuration

The chatbot is configured to work with RunPod's OpenAI-compatible API endpoint:
- **Endpoint**: `/v1/chat/completions`
- **Model**: `MiniMax-M1`
- **Temperature**: 1.0
- **Top P**: 0.95

## Project Structure

```
src/
├── components/
│   ├── ChatInterface.tsx    # Main chat component
│   ├── ErrorBoundary.tsx    # Error handling
│   └── ui/                  # shadcn/ui components
├── services/
│   └── chatService.ts       # API communication
├── hooks/                   # Custom React hooks
├── lib/
│   └── utils.ts            # Utility functions
└── main.tsx                # Application entry point
```

## Building for Production

```bash
yarn build
# or
npm run build
```

The built files will be in the `dist/` directory.

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Lucide React** - Icons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

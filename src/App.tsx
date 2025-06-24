import ChatInterface from './components/ChatInterface'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <div className="h-full w-full bg-gray-50">
        <ChatInterface />
      </div>
    </ErrorBoundary>
  )
}

export default App

// Enhanced Dashboard Stats - React component for the main dashboard
import { useState, useEffect } from 'react';
import EnhancedStats from './components/EnhancedStats';
import './index.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage (set by the main app)
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
  }, []);

  // This component only renders the enhanced stats
  // It mounts to #react-stats-container in the main dashboard
  if (!currentUser) {
    return null; // Don't render if no user
  }

  return <EnhancedStats userId={currentUser.user_id} />;
}

export default App;

 

interface WelcomeProps {
  username: string;
  onLogout: () => void;
}

export default function Welcome({ username, onLogout }: WelcomeProps) {
  return (
    <section style={{ 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1>Welcome!</h1>
      <p>You are logged in as: <strong>{username}</strong></p>
      
      <button 
        onClick={onLogout}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Logout
      </button>
    </section>
  );
}

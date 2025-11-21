import Link from 'next/link';
import React from 'react';

// The component function type is React.FC or simply a function returning JSX.
export default function NotFound(): React.ReactElement {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '40px', 
      fontFamily: 'sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ 
        fontSize: '4em', 
        marginBottom: '10px' 
      }}>
        404
      </h1>
      <h2 style={{ 
        fontSize: '1.5em', 
        marginBottom: '20px', 
        color: '#666' 
      }}>
        Page Not Found
      </h2>
      <p style={{ 
        fontSize: '1em', 
        marginBottom: '30px' 
      }}>
        Could not find the requested resource.
      </p>
      {/* Use the next/link component */}
      <Link href="/" style={{ 
        color: '#0070f3', 
        textDecoration: 'underline' 
      }}>
        Return to Home
      </Link>
    </div>
  );
}
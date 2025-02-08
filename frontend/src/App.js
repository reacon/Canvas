import './App.css';
import ImageEditor from './components/ImageEditor';
import { BrowserRouter, Routes, Route  } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthContainer from './containers/AuthContainer';
import { AuthProvider } from './contexts/AuthContext';



function App() {
  return (
    <GoogleOAuthProvider clientId="5387931914-pmju9ouc94tng9cuphq4qh1ci2650e36.apps.googleusercontent.com">
      <BrowserRouter>
        <div className="App">
          
         <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthContainer />} />
            <Route path="/editor" element={<ImageEditor />} />
          </Routes>
        </AuthProvider> 
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;

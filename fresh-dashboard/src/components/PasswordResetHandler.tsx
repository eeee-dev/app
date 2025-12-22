import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component to handle password reset tokens in URL hash
 * Automatically redirects to reset password page when recovery token is detected
 */
export default function PasswordResetHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a recovery token in the URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (accessToken && type === 'recovery') {
      // Redirect to reset password page with the token in the URL
      navigate('/reset-password' + window.location.hash);
    }
  }, [navigate]);

  return null;
}
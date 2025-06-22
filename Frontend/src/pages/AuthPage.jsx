import { useParams, Navigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import AuthLayout from '../components/auth/AuthLayout';

const AuthPage = () => {
  const { mode } = useParams(); // 'login' or 'signup'
  
  // Redirect to login if no mode or invalid mode
  if (!mode || (mode !== 'login' && mode !== 'signup')) {
    return <Navigate to="/auth/login" replace />;
  }

  const isLogin = mode === 'login';
  
  const pageConfig = {
    login: {
      title: 'Log in to your account',
      subtitle: "Don't have an account?",
      linkText: 'Sign up here',
      linkTo: '/auth/signup'
    },
    signup: {
      title: 'Create a new account',
      subtitle: 'Already have an account?',
      linkText: 'Log in here',
      linkTo: '/auth/login'
    }
  };

  const config = pageConfig[mode];

  return (
    <AuthLayout 
      title={config.title}
      subtitle={config.subtitle}
      linkText={config.linkText}
      linkTo={config.linkTo}
    >
      {isLogin ? <LoginForm /> : <SignupForm />}
    </AuthLayout>
  );
};

export default AuthPage;
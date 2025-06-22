import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AuthLayout = ({ title, subtitle, linkText, linkTo, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4">
        <Link 
          to="/" 
          className="flex items-center text-teal-600 hover:text-teal-700 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </div>

      {/* Auth Form Container */}
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-gray-600">
            {subtitle}{' '}
            <Link to={linkTo} className="text-teal-600 hover:text-teal-700 font-medium">
              {linkText}
            </Link>
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
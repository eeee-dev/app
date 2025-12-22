import React from 'react';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800">Page Not Found</h2>
            <p className="text-gray-600">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-600 mb-2">Here are some helpful links:</p>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigate('/')}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"
                >
                  <Home className="h-3 w-3" />
                  Dashboard Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/expenses')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Expense Management
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/budgets')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Budget Planning
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/reports')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Financial Reports
                </button>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate(-1)}
              className="gap-2 border border-gray-300 bg-transparent hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Home className="h-4 w-4" />
              Return to Dashboard
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 pt-4 border-t">
          If you believe this is an error, please contact your system administrator.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
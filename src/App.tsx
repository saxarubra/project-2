import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import ShiftList from './components/shifts/ShiftList';
import { LogOut, User } from 'lucide-react';

export default function App() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome</h2>
          <div className="space-y-6">
            <LoginForm />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up</span>
              </div>
            </div>
            <SignUpForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Shift Management</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-md">
              <User className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium text-indigo-700">{user.user_metadata.full_name}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ShiftList />
      </main>
    </div>
  );
}
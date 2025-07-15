
import React from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome, AlertTriangle, Soup } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPrompt() {
  const handleLogin = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-sm bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <Soup className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">מטבח קהילתי</CardTitle>
            <CardDescription className="text-slate-600 pt-1">
              יש להתחבר עם חשבון מורשה כדי לנהל את המערכת.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Button
                onClick={handleLogin}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl py-6 text-base"
              >
                <Chrome className="w-5 h-5 mr-3" />
                Sign in with Google
              </Button>
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Access is restricted to authorized administrators only. Contact the super admin if you need access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

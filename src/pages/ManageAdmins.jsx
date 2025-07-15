
import React, { useState, useEffect } from "react";
import { AdminUser } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Plus, Trash2, UserX, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ManageAdmins() {
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    setLoading(true);
    try {
      const admins = await AdminUser.list("-created_date");
      setAdminUsers(admins);
    } catch (error) {
      console.error("Error loading admin users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const existingAdmin = adminUsers.find(admin => admin.email === newAdminEmail);
      if (existingAdmin) {
        toast({
          title: "מנהל כבר קיים",
          description: "כתובת אימייל זו כבר רשומה כמנהל.",
          variant: "destructive",
        });
        return;
      }

      await AdminUser.create({
        email: newAdminEmail,
        role: 'admin',
        active: true
      });

      toast({
        title: "מנהל נוסף בהצלחה",
        description: `${newAdminEmail} יכול כעת לגשת למערכת הניהול.`,
      });

      setNewAdminEmail('');
      setShowAddForm(false);
      await loadAdminUsers();
    } catch (error) {
      console.error("Error adding admin:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן היה להוסיף מנהל. נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAdminStatus = async (adminId, currentStatus) => {
    try {
      await AdminUser.update(adminId, { active: !currentStatus });
      toast({
        title: currentStatus ? "מנהל הושבת" : "מנהל הופעל",
        description: `הגישה למערכת הניהול ${currentStatus ? 'בוטלה' : 'הוענקה'}.`,
      });
      await loadAdminUsers();
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן היה לעדכן את סטטוס המנהל. נסה שוב.",
        variant: "destructive",
      });
    }
  };

  const deleteAdmin = async (adminId, email) => {
    if (email === 'sahar.h.barak@gmail.com') {
      toast({
        title: "לא ניתן למחוק מנהל על",
        description: "לא ניתן להסיר את חשבון מנהל העל.",
        variant: "destructive",
      });
      return;
    }

    try {
      await AdminUser.delete(adminId);
      toast({
        title: "מנהל הוסר",
        description: `הגישה של ${email} למערכת הניהול הוסרה.`,
        variant: "destructive",
      });
      await loadAdminUsers();
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן היה להסיר את המנהל. נסה שוב.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="text-right">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">ניהול מנהלים</h1>
            <p className="text-slate-600">שליטה על בעלי גישה למערכת הניהול</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
          >
            <Plus className="w-4 h-4 ml-2" />
            הוסף מנהל
          </Button>
        </div>

        {showAddForm && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                הוספת מנהל חדש
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAdmin} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-2 block">
                    כתובת אימייל
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="bg-white/50 border-slate-200 focus:border-slate-400 rounded-xl"
                    required
                    dir="ltr"
                  />
                </div>
                <div className="flex items-end gap-2">
                   <Button
                    type="submit"
                    disabled={isSubmitting || !newAdminEmail}
                    className="bg-slate-900 hover:bg-slate-800 rounded-xl"
                  >
                    {isSubmitting ? (
                      <>
                        מוסיף...
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      </>
                    ) : (
                      'הוסף מנהל'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewAdminEmail('');
                    }}
                    className="rounded-xl"
                  >
                    ביטול
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              מנהלי מערכת ({adminUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {adminUsers.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">לא נמצאו מנהלים.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adminUsers.map((admin, index) => (
                  <motion.div
                    key={admin.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col md:flex-row items-center justify-between p-4 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-all duration-200"
                  >
                    {admin.email !== 'sahar.h.barak@gmail.com' && (
                      <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="rounded-xl"
                            >
                              <Trash2 className="w-4 h-4 ml-1" />
                              מחק
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader className="text-right">
                              <AlertDialogTitle>הסרת גישת מנהל</AlertDialogTitle>
                              <AlertDialogDescription>
                                האם אתה בטוח שברצונך להסיר גישת מנהל עבור {admin.email}? 
                                המשתמש לא יוכל יותר לגשת למערכת הניהול.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-row-reverse">
                              <AlertDialogCancel>ביטול</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteAdmin(admin.id, admin.email)}>
                                הסר גישה
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAdminStatus(admin.id, admin.active)}
                          className={`rounded-xl ${
                            admin.active 
                              ? 'hover:bg-red-50 hover:border-red-200' 
                              : 'hover:bg-green-50 hover:border-green-200'
                          }`}
                        >
                          {admin.active ? (
                            <>
                              השבת
                              <UserX className="w-4 h-4 mr-1" />
                            </>
                          ) : (
                            <>
                              הפעל
                              <UserCheck className="w-4 h-4 mr-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                     <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="font-semibold text-slate-900">{admin.email}</p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                           <Badge 
                            className={
                              admin.active 
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {admin.active ? 'פעיל' : 'לא פעיל'}
                          </Badge>
                          <Badge 
                            className={
                              admin.role === 'super_admin' 
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }
                          >
                            {admin.role === 'super_admin' ? 'מנהל על' : 'מנהל'}
                          </Badge>
                        </div>
                      </div>
                       <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {admin.email.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

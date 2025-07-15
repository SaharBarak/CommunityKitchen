import React, { useState, useEffect } from "react";
import { Survey } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Save, Users, Calendar, MapPin, Clock, AlertTriangle, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

export default function EditSurvey() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyId, setSurveyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    setSurveyId(id);

    const fetchSurvey = async () => {
      setLoading(true);
      if (id) {
        try {
          const surveys = await Survey.list();
          const surveyToEdit = surveys.find(s => s.id === id);
          if (surveyToEdit) {
            if (surveyToEdit.date) {
              surveyToEdit.date = new Date(surveyToEdit.date).toISOString().split('T')[0];
            }
            setFormData(surveyToEdit);
          } else {
            setNotFound(true);
          }
        } catch (error) {
          console.error("Error fetching survey:", error);
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };
    fetchSurvey();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!surveyId) return;
    setIsSubmitting(true);

    try {
      const surveyData = {
        ...formData,
        max_participants: parseInt(formData.max_participants),
      };
      delete surveyData.id;
      delete surveyData.created_date;
      delete surveyData.updated_date;
      delete surveyData.created_by;

      await Survey.update(surveyId, surveyData);
      navigate(createPageUrl("ManageSurveys"));
    } catch (error) {
      console.error("Error updating survey:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex justify-center items-center h-screen">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">אירוע לא נמצא</h2>
            <p className="text-slate-600 mb-6">לא ניתן למצוא את האירוע שברצונך לערוך.</p>
            <Button asChild className="bg-slate-900 hover:bg-slate-800 rounded-xl">
              <Link to={createPageUrl("Dashboard")}>
                <LayoutDashboard className="w-4 h-4 ml-2" />
                חזרה ללוח הבקרה
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("ManageSurveys"))}
            className="hover:bg-slate-100 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            חזרה לניהול אירועים
          </Button>
        </div>

        <div className="mb-8 text-right">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">עריכת אירוע</h1>
          <p className="text-slate-600">עדכן את פרטי האירוע הקהילתי שלך.</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg" dir="rtl">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              פרטי האירוע
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                  שם האירוע *
                </Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="bg-white/50 border-slate-200 focus:border-slate-400 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                  תיאור האירוע
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="bg-white/50 border-slate-200 focus:border-slate-400 rounded-xl resize-none"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-slate-700">
                    מיקום
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="bg-white/50 border-slate-200 focus:border-slate-400 rounded-xl pr-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-slate-700">
                    תאריך האירוע
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="bg-white/50 border-slate-200 focus:border-slate-400 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-medium text-slate-700">
                    שעת האירוע
                  </Label>
                  <div className="relative">
                    <Clock className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="time"
                      value={formData.time || ''}
                      onChange={(e) => handleInputChange("time", e.target.value)}
                      className="bg-white/50 border-slate-200 focus:border-slate-400 rounded-xl pr-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_participants" className="text-sm font-medium text-slate-700">
                    מספר משתתפים מקסימלי *
                  </Label>
                  <div className="relative">
                    <Users className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="max_participants"
                      type="number"
                      min="4"
                      max="20"
                      value={formData.max_participants}
                      onChange={(e) => handleInputChange("max_participants", e.target.value)}
                      className="bg-white/50 border-slate-200 focus:border-slate-400 rounded-xl pr-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="table_shape" className="text-sm font-medium text-slate-700">
                    צורת השולחן
                  </Label>
                  <Select value={formData.table_shape} onValueChange={(value) => handleInputChange("table_shape", value)}>
                    <SelectTrigger className="bg-white/50 border-slate-200 focus:border-slate-400 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round">שולחן עגול</SelectItem>
                      <SelectItem value="rectangle">שולחן מלבני</SelectItem>
                      <SelectItem value="oval">שולחן אובלי</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-slate-700">
                    סטטוס
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger className="bg-white/50 border-slate-200 focus:border-slate-400 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">טיוטה</SelectItem>
                      <SelectItem value="active">פעיל</SelectItem>
                      <SelectItem value="closed">סגור</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-start gap-3 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      שומר...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      שמור שינויים
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("ManageSurveys"))}
                  className="rounded-xl"
                >
                  ביטול
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
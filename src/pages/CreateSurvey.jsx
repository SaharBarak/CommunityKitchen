import React, { useState } from "react";
import { Survey } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Save, Users, Calendar, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateSurvey() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    max_participants: 8,
    table_shape: "round",
    status: "draft",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const surveyLink = Math.random().toString(36).substring(2, 15);
      const surveyData = {
        ...formData,
        max_participants: parseInt(formData.max_participants),
        survey_link: surveyLink
      };

      await Survey.create(surveyData);
      navigate(createPageUrl("ManageSurveys"));
    } catch (error) {
      console.error("Error creating survey:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="hover:bg-slate-100 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            חזרה ללוח הבקרה
          </Button>
        </div>

        <div className="mb-8 text-right">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">יצירת אירוע חדש</h1>
          <p className="text-slate-600">הגדירו את כל הפרטים לאירוע הקהילתי הבא שלכם</p>
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
                  placeholder="לדוגמה: ארוחת חג קהילתית"
                  value={formData.title}
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
                  placeholder="פרטים נוספים על האירוע, מה להביא וכו'"
                  value={formData.description}
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
                      placeholder="לדוגמה: רחוב ההגנה 20, גבעתיים"
                      value={formData.location}
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
                    value={formData.date}
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
                      placeholder="לדוגמה: 19:30"
                      value={formData.time}
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
                      <SelectValue placeholder="בחר צורת שולחן" />
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
                      <SelectValue placeholder="בחר סטטוס" />
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
                      יוצר...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      צור אירוע
                    </>
                  )}
                </Button>
                 <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("Dashboard"))}
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
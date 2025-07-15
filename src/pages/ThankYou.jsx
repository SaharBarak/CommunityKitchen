import React, { useState, useEffect } from "react";
import { Survey } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, MapPin, Clock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ThankYou() {
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurvey = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const surveyId = urlParams.get('surveyId');
      if (surveyId) {
        try {
          const surveys = await Survey.list();
          const foundSurvey = surveys.find(s => s.id === surveyId);
          setSurvey(foundSurvey);
        } catch (error) {
          console.error("Error fetching survey:", error);
        }
      }
      setLoading(false);
    };

    fetchSurvey();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-lg bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">
              תודה שנרשמת!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            {survey && (
              <div className="text-lg text-slate-700 space-y-4">
                <p>מצפים לראותך באירוע של המטבח הקהילתי!</p>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5 text-rose-500" />
                    <span>בתאריך: {survey.date ? new Date(survey.date).toLocaleDateString('he-IL') : 'יפורסם'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5 text-rose-500" />
                    <span>בשעה: {survey.time || 'תפורסם'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    <span>במיקום: {survey.location || 'יפורסם'}</span>
                  </div>
                </div>
              </div>
            )}
            <p className="text-slate-600 text-sm">
              נשלח אליך מייל עם אישור ההזמנה. ניתן לבטל את ההרשמה עד יומיים לפני מועד האירוע דרך הקישור במייל.
            </p>
            {survey && (
              <Button asChild className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-md">
                <Link to={createPageUrl(`Survey?id=${survey.survey_link || survey.id}`)}>
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  חזרה לעמוד האירוע
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Participant, Survey } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Calendar, MapPin, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function CancelReservation() {
  const [participant, setParticipant] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReservationData();
  }, []);

  const loadReservationData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (!token) {
        setError('missing_token');
        setLoading(false);
        return;
      }

      const [participants, surveys] = await Promise.all([
        Participant.list(),
        Survey.list()
      ]);

      const foundParticipant = participants.find(p => p.cancellation_token === token && p.status === 'confirmed');
      
      if (!foundParticipant) {
        setError('invalid_token');
        setLoading(false);
        return;
      }

      const foundSurvey = surveys.find(s => s.id === foundParticipant.survey_id);
      
      setParticipant(foundParticipant);
      setSurvey(foundSurvey);
      
      if (foundSurvey?.date) {
        const eventDate = new Date(foundSurvey.date);
        const now = new Date();
        const diffTime = eventDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 2) {
          setError('too_late');
        }
      }
      
    } catch (error) {
      console.error("Error loading reservation:", error);
      setError('general_error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancellation = async () => {
    setCancelling(true);
    try {
      await Participant.update(participant.id, {
        status: 'cancelled'
      });
      setCancelled(true);
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      setError('cancellation_failed');
    } finally {
      setCancelling(false);
    }
  };

  const errorMessages = {
    missing_token: "קישור ביטול לא תקין",
    invalid_token: "קישור הביטול הזה לא תקין או שכבר נעשה בו שימוש",
    too_late: "ביטול אפשרי רק עד יומיים לפני האירוע",
    general_error: "אירעה שגיאה בטעינת ההזמנה שלך",
    cancellation_failed: "נכשל בביטול ההזמנה. אנא נסה שוב."
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">שגיאה</h2>
            <p className="text-red-600">{errorMessages[error]}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">ההזמנה בוטלה</h2>
            <p className="text-green-600">ההזמנה שלך בוטלה בהצלחה. המקום שלך זמין כעת לאחרים/ות.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900 text-right">
                ביטול הזמנה
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 text-right">
                  פרטי ההזמנה
                </h3>
                <div className="space-y-3 text-right">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <Users className="w-5 h-5 text-slate-600" />
                    <div>
                      <span className="font-medium text-slate-700">שם: </span>
                      <span className="text-slate-900">{participant?.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded text-xs font-bold flex items-center justify-center">
                      #{participant?.seat_number}
                    </span>
                    <div>
                      <span className="font-medium text-slate-700">מספר מקום: </span>
                      <span className="text-slate-900">#{participant?.seat_number}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <Calendar className="w-5 h-5 text-slate-600" />
                    <div>
                      <span className="font-medium text-slate-700">אירוע: </span>
                      <span className="text-slate-900">{survey?.title}</span>
                    </div>
                  </div>
                  
                  {survey?.date && (
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <Calendar className="w-5 h-5 text-slate-600" />
                      <div>
                        <span className="font-medium text-slate-700">תאריך: </span>
                        <span className="text-slate-900">
                          {new Date(survey.date).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {survey?.time && (
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <Clock className="w-5 h-5 text-slate-600" />
                      <div>
                        <span className="font-medium text-slate-700">שעה: </span>
                        <span className="text-slate-900">{survey.time}</span>
                      </div>
                    </div>
                  )}
                  
                  {survey?.location && (
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <MapPin className="w-5 h-5 text-slate-600" />
                      <div>
                        <span className="font-medium text-slate-700">מיקום: </span>
                        <span className="text-slate-900">{survey.location}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-right">
                <p className="text-amber-800">האם את/ה בטוח/ה שברצונך לבטל את ההזמנה? פעולה זו לא ניתנת לביטול.</p>
              </div>
              
              <div className="flex gap-3 flex-row-reverse">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg"
                  onClick={() => window.close()}
                >
                  שמרו על ההזמנה
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 rounded-lg"
                  onClick={handleCancellation}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      מבטל...
                    </>
                  ) : (
                    'כן, בטלו את ההזמנה'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

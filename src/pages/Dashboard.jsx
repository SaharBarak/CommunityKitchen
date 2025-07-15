
import React, { useState, useEffect } from "react";
import { Survey, Participant } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Calendar, Users, Eye, BarChart3, Clock, MapPin, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function Dashboard() {
  const [surveys, setSurveys] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [surveysData, participantsData] = await Promise.all([
        Survey.list("-created_date"),
        Participant.list()
      ]);
      setSurveys(surveysData);
      // Only count confirmed participants
      setParticipants(participantsData.filter(p => p.status === 'confirmed'));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const totalEvents = surveys.length;
    const activeEvents = surveys.filter(s => s.status === 'active').length;
    const totalParticipants = participants.length; // Now only confirmed participants
    const avgParticipants = totalEvents > 0 ? (totalParticipants / totalEvents).toFixed(1) : 0;
    
    return { totalEvents, activeEvents, totalParticipants, avgParticipants };
  };

  const sendEventReminder = async (survey) => {
    setSendingReminder(survey.id);
    try {
      const { SendEmail } = await import("@/api/integrations");
      const { EmailTemplate } = await import("@/api/entities");
      
      const surveyParticipants = participants.filter(p => p.survey_id === survey.id && p.status === 'confirmed');
      
      if (surveyParticipants.length === 0) {
        toast({
          title: "אין משתתפים/ות",
          description: "לאירוע זה אין משתתפים/ות מאושרים/ות לשלוח להם תזכורות.",
          variant: "destructive",
        });
        return;
      }

      const templates = await EmailTemplate.list();
      let template = templates.find(t => t.survey_id === survey.id);
      
      if (!template) {
        template = templates.find(t => t.is_default);
      }
      
      if (!template) {
        template = {
          subject: "תזכורת לאירוע - {event_title}",
          body: `שלום {name},

זוהי תזכורת ידידותית לאירוע הקרב:

אירוע: {event_title}
תאריך: {event_date}
שעה: {event_time}
מיקום: {event_location}
המקום שלך: #{seat_number}

אנחנו מצפים לראות אותך!

אם אתה צריך לבטל, אנא השתמש בקישור: {cancellation_link}

בברכה,
צוות האירוע`
        };
      }

      const emailPromises = surveyParticipants.map(async (participant) => {
        const cancellationLink = `${window.location.origin}${createPageUrl(`CancelReservation?token=${participant.cancellation_token}`)}`;
        
        const subject = template.subject.replace(/{event_title}/g, survey.title);
        
        let bodyText = template.body
          .replace(/{name}/g, participant.name)
          .replace(/{event_title}/g, survey.title)
          .replace(/{event_date}/g, survey.date ? new Date(survey.date).toLocaleDateString('he-IL') : 'יפורסם')
          .replace(/{event_time}/g, survey.time || 'יפורסם')
          .replace(/{event_location}/g, survey.location || 'יפורסם')
          .replace(/{seat_number}/g, participant.seat_number)
          .replace(/{cancellation_link}/g, cancellationLink);

        // ULTRA-ROBUST HTML EMAIL - same as confirmation email
        const htmlEmail = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        /* Multiple CSS methods to ensure spacing preservation */
        * { box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif !important;
            font-size: 16px !important;
            line-height: 1.6 !important;
            color: #333333 !important;
            direction: rtl !important;
            text-align: right !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #f5f5f5 !important;
            -webkit-text-size-adjust: 100% !important;
            -ms-text-size-adjust: 100% !important;
        }
        
        .email-container {
            max-width: 600px !important;
            margin: 20px auto !important;
            background-color: #ffffff !important;
            border-radius: 12px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
            overflow: hidden !important;
        }
        
        .email-content {
            padding: 40px 30px !important;
            font-size: 16px !important;
            line-height: 1.8 !important;
            color: #333333 !important;
            
            /* MULTIPLE methods to preserve whitespace and formatting */
            white-space: pre-wrap !important;
            white-space: -moz-pre-wrap !important;
            white-space: -pre-wrap !important;
            white-space: -o-pre-wrap !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
        }
        
        /* Ensure links are visible and styled */
        a {
            color: #dc2626 !important;
            text-decoration: underline !important;
            font-weight: bold !important;
        }
        
        /* Mobile responsiveness */
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 10px !important;
                border-radius: 8px !important;
            }
            .email-content {
                padding: 25px 20px !important;
                font-size: 15px !important;
            }
        }
        
        /* Prevent email clients from overriding styles */
        table { border-collapse: collapse !important; }
        .ExternalClass { width: 100% !important; }
        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {
            line-height: 100% !important;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-content">${bodyText.replace(/\n/g, '\n')}</div>
    </div>
</body>
</html>`;

        return SendEmail({
          to: participant.email,
          subject: subject,
          body: htmlEmail
        });
      });

      await Promise.all(emailPromises);

      toast({
        title: "תזכורות נשלחו!",
        description: `תזכורות לאירוע נשלחו ל-${surveyParticipants.length} משתתפים/ות.`,
      });

    } catch (error) {
      console.error("Error sending reminders:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן היה לשלוח תזכורות. נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setSendingReminder(null);
    }
  };

  const stats = getStats();

  const statusColors = {
    active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    closed: "bg-red-100 text-red-800 border-red-200",
    draft: "bg-amber-100 text-amber-800 border-amber-200"
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="text-right">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">לוח בקרה</h1>
            <p className="text-slate-600">מטבח קהילתי - ניהול אירועים</p>
          </div>
          <Link to={createPageUrl("CreateSurvey")}>
            <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
              <Plus className="w-4 h-4 ml-2" />
              צור אירוע חדש
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-rose-50 to-pink-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-200 to-pink-300 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-rose-700" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-rose-700 mb-1">סה״כ אירועים</p>
                    <p className="text-2xl font-bold text-rose-900">{stats.totalEvents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                   <div className="w-12 h-12 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-700 mb-1">אירועים פעילים</p>
                    <p className="text-2xl font-bold text-emerald-900">{stats.activeEvents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-sky-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-200 to-blue-300 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-sky-700" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-sky-700 mb-1">סה"כ משתתפים/ות</p>
                    <p className="text-2xl font-bold text-sky-900">{stats.totalParticipants}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-amber-300 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-orange-700" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-700 mb-1">ממוצע משתתפים/ות</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.avgParticipants}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-700" />
              אירועים אחרונים
            </CardTitle>
          </CardHeader>
          <CardContent>
            {surveys.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">עדיין לא נוצרו אירועים.</p>
                <Link to={createPageUrl("CreateSurvey")}>
                  <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl">
                    <Plus className="w-4 h-4 ml-2" />
                    צור את האירוע הראשון שלך
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {surveys.slice(0, 5).map((survey, index) => (
                  <motion.div
                    key={survey.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-rose-50 rounded-xl hover:from-slate-100 hover:to-rose-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <Link to={createPageUrl(`Survey?id=${survey.id}`)}>
                        <Button variant="ghost" size="sm" className="hover:bg-rose-200/50 rounded-xl" title="צפייה באירוע">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      {participants.filter(p => p.survey_id === survey.id && p.status === 'confirmed').length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => sendEventReminder(survey)}
                          disabled={sendingReminder === survey.id}
                          className="hover:bg-blue-200/50 rounded-xl"
                          title="שליחת תזכורת למשתתפים/ות"
                        >
                          {sendingReminder === survey.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      
                      <Badge className={statusColors[survey.status]}>
                        {survey.status === 'active' ? 'פעיל' : survey.status === 'draft' ? 'טיוטה' : 'סגור'}
                      </Badge>
                    </div>
                    <div className="flex-1 text-right">
                      <h3 className="font-semibold text-slate-900 mb-1">{survey.title}</h3>
                      <div className="flex items-center justify-end gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          {participants.filter(p => p.survey_id === survey.id).length} / {survey.max_participants}
                          <Users className="w-4 h-4" />
                        </span>
                        <span className="flex items-center gap-1">
                          {survey.location || 'לא הוגדר מיקום'}
                          <MapPin className="w-4 h-4" />
                        </span>
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


import React, { useState, useEffect } from "react";
import { Survey, Participant } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Eye, Copy, Users, Calendar, MapPin, ExternalLink, Plus, Edit, Trash2, Bell } from "lucide-react";
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

export default function ManageSurveys() {
  const [surveys, setSurveys] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [surveysData, participantsData] = await Promise.all([
        Survey.list("-created_date"),
        Participant.list()
      ]);
      setSurveys(surveysData);
      // Only include confirmed participants
      setParticipants(participantsData.filter(p => p.status === 'confirmed'));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (survey) => {
    const linkIdentifier = survey.survey_link || survey.id;
    const link = `${window.location.origin}${createPageUrl(`Survey?id=${linkIdentifier}`)}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "הקישור הועתק!",
      description: "הקישור הציבורי לאירוע הועתק ללוח.",
    });
  };

  const handleDelete = async (surveyId) => {
    try {
      const surveyParticipants = participants.filter(p => p.survey_id === surveyId);
      await Promise.all(surveyParticipants.map(p => Participant.delete(p.id)));
      await Survey.delete(surveyId);
      toast({
        title: "האירוע נמחק",
        description: "האירוע וכל המשתתפים/ות בו נמחקו.",
        variant: "destructive",
      });
      await loadData();
    } catch (error) {
      console.error("Error deleting survey:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן היה למחוק את האירוע. נסה שוב.",
        variant: "destructive",
      });
    }
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
        
        // Convert to HTML format to preserve spacing
        let bodyText = template.body
          .replace(/{name}/g, participant.name)
          .replace(/{event_title}/g, survey.title)
          .replace(/{event_date}/g, survey.date ? new Date(survey.date).toLocaleDateString('he-IL') : 'יפורסם')
          .replace(/{event_time}/g, survey.time || 'יפורסם')
          .replace(/{event_location}/g, survey.location || 'יפורסם')
          .replace(/{seat_number}/g, participant.seat_number)
          .replace(/{cancellation_link}/g, cancellationLink);

        // ULTRA-ROBUST HTML EMAIL - same format
        const htmlEmail = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
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
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
        }
        
        a {
            color: #dc2626 !important;
            text-decoration: underline !important;
            font-weight: bold !important;
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

  const statusColors = {
    active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    closed: "bg-red-100 text-red-800 border-red-200",
    draft: "bg-amber-100 text-amber-800 border-amber-200"
  };

  const getParticipantCount = (surveyId) => {
    return participants.filter(p => p.survey_id === surveyId && p.status === 'confirmed').length;
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="text-right">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">ניהול אירועים</h1>
            <p className="text-slate-600">צפייה, עריכה וניהול של כל האירועים הקהילתיים</p>
          </div>
          <Link to={createPageUrl("CreateSurvey")}>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
              <Plus className="w-4 h-4 ml-2" />
              צור אירוע חדש
            </Button>
          </Link>
        </div>

        {surveys.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">אין אירועים עדיין</h3>
              <p className="text-slate-600 mb-6">צרו את האירוע הראשון שלכם כדי להתחיל.</p>
              <Link to={createPageUrl("CreateSurvey")}>
                <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl">
                  <Plus className="w-4 h-4 ml-2" />
                  צור את האירוע הראשון שלך
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {surveys.map((survey, index) => (
              <motion.div
                key={survey.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="p-6 pb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[survey.status]}>
                          {survey.status === 'active' ? 'פעיל' : survey.status === 'draft' ? 'טיוטה' : 'סגור'}
                        </Badge>
                      </div>
                      <div className="flex-1 text-right">
                        <CardTitle className="text-xl font-bold text-slate-900 mb-2">
                          {survey.title}
                        </CardTitle>
                        <div className="flex items-center justify-end flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1.5">
                            {getParticipantCount(survey.id)} / {survey.max_participants} משתתפים/ות
                            <Users className="w-4 h-4" />
                          </span>
                          {survey.date && (
                            <span className="flex items-center gap-1.5">
                              {new Date(survey.date).toLocaleDateString()}
                              <Calendar className="w-4 h-4" />
                            </span>
                          )}
                          {survey.location && (
                            <span className="flex items-center gap-1.5">
                              {survey.location}
                              <MapPin className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-4">
                    <div className="flex flex-wrap-reverse gap-3 justify-end">
                       <Button 
                        asChild
                        variant="ghost" 
                        size="sm"
                        className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl"
                      >
                        <a href={createPageUrl(`Survey?id=${survey.survey_link || survey.id}`)} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 ml-2" />
                          פתח עמוד ציבורי
                        </a>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive-outline" 
                            size="sm"
                            className="rounded-xl"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            מחק
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                            <AlertDialogDescription>
                              פעולה זו תמחק לצמיתות את האירוע "{survey.title}" ואת כל
                              נתוני המשתתפים/ות שלו. לא ניתן לשחזר פעולה זו.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ביטול</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(survey.id)}>
                              כן, למחוק
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <Link to={createPageUrl(`EditSurvey?id=${survey.id}`)}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="hover:bg-slate-100 rounded-xl"
                        >
                          <Edit className="w-4 h-4 ml-2" />
                          ערוך
                        </Button>
                      </Link>

                      {getParticipantCount(survey.id) > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => sendEventReminder(survey)}
                          disabled={sendingReminder === survey.id}
                          className="hover:bg-blue-50 hover:border-blue-200 rounded-xl"
                        >
                          {sendingReminder === survey.id ? (
                            <>
                              שולח...
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            </>
                          ) : (
                            <>
                              <Bell className="w-4 h-4 ml-2" />
                              שלח תזכורת
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyLink(survey)}
                        className="hover:bg-slate-100 rounded-xl"
                      >
                        <Copy className="w-4 h-4 ml-2" />
                        העתק קישור
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

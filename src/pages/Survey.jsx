
import React, { useState, useEffect } from "react";
import { Survey, Participant, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, CheckCircle, AlertTriangle, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import TableView from "../components/survey/TableView";
import ParticipantModal from "../components/survey/ParticipantModal";
import ParticipantList from "../components/survey/ParticipantList";

export default function SurveyPage() {
  const [survey, setSurvey] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSurveyData();
    checkAdminStatusSilently();
  }, []);

  const checkAdminStatusSilently = async () => {
    try {
      await User.me();
      setIsAdmin(true);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const loadSurveyData = async () => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const surveyIdentifier = urlParams.get('id');
      
      if (!surveyIdentifier) {
        setLoading(false);
        return;
      }

      const [allSurveys, allParticipants] = await Promise.all([
        Survey.list(),
        Participant.list()
      ]);
      
      const currentSurvey = allSurveys.find(s => s.survey_link === surveyIdentifier || s.id === surveyIdentifier);
      
      if (currentSurvey) {
        // Only include confirmed participants, exclude cancelled ones for seat availability
        const currentParticipants = allParticipants.filter(p => p.survey_id === currentSurvey.id && p.status === 'confirmed');
        setSurvey(currentSurvey);
        setParticipants(currentParticipants);
      }
    } catch (error) {
      console.error("Error loading survey:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seatNumber) => {
    const isOccupied = participants.some(p => p.seat_number === seatNumber);
    if (isOccupied) return;
    
    setSelectedSeat(seatNumber);
    setShowModal(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // Check if email already exists for this survey
      const existingParticipant = participants.find(p => 
        p.email.toLowerCase() === formData.email.toLowerCase() && 
        p.status === 'confirmed'
      );
      
      if (existingParticipant) {
        alert('כתובת האימייל הזו כבר רשומה לאירוע זה');
        setIsSubmitting(false);
        setShowModal(false);
        setSelectedSeat(null);
        return;
      }

      const cancellationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const participantData = {
        survey_id: survey.id,
        seat_number: selectedSeat,
        cancellation_token: cancellationToken,
        status: "confirmed",
        ...formData
      };

      const newParticipant = await Participant.create(participantData);
      
      await sendConfirmationEmail(newParticipant, survey, formData.email);
      
      navigate(createPageUrl(`ThankYou?surveyId=${survey.id}`));
      
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
      setSelectedSeat(null);
    }
  };

  const sendConfirmationEmail = async (participant, survey, email) => {
    try {
      const { EmailTemplate } = await import("@/api/entities");
      const { SendEmail } = await import("@/api/integrations");
      
      const templates = await EmailTemplate.list();
      let template = templates.find(t => t.survey_id === survey.id);
      
      if (!template) {
        template = templates.find(t => t.is_default);
      }
      
      if (!template) {
        template = {
          subject: "הזמנת המקום שלך אושרה!",
          body: `שלום {name},

הזמנת המקום שלך אושרה בהצלחה!

אירוע: {event_title}
תאריך: {event_date}
שעה: {event_time}
מיקום: {event_location}
המקום שלך: #{seat_number}

חשוב: אם אתה צריך לבטל, אנא עשה זאת לפחות יומיים מראש באמצעות הקישור:
{cancellation_link}

אנחנו מצפים לראות אותך באירוע!

בברכה,
צוות האירוע`
        };
      }
      
      const cancellationLink = `${window.location.origin}${createPageUrl(`CancelReservation?token=${participant.cancellation_token}`)}`;
      
      const subject = template.subject.replace(/{event_title}/g, survey.title);
      
      // Replace variables in template
      let bodyText = template.body
        .replace(/{name}/g, participant.name)
        .replace(/{event_title}/g, survey.title)
        .replace(/{event_date}/g, survey.date ? new Date(survey.date).toLocaleDateString('he-IL') : 'יפורסם')
        .replace(/{event_time}/g, survey.time || 'יפורסם')
        .replace(/{event_location}/g, survey.location || 'יפורסם')
        .replace(/{seat_number}/g, participant.seat_number)
        .replace(/{cancellation_link}/g, cancellationLink);

      // ULTRA-ROBUST HTML EMAIL WITH MULTIPLE FORMATTING METHODS
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
            
            /* Additional preservation methods */
            font-family: monospace, 'Courier New', Courier !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif !important;
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
        <div class="email-content">${bodyText}</div>
    </div>
</body>
</html>`;

      await SendEmail({
        to: email,
        subject: subject,
        body: htmlEmail
      });
      
    } catch (error) {
      console.error("Error sending confirmation email:", error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSeat(null);
  };

  const handleCancelParticipant = async (participantId) => {
    setIsSubmitting(true);
    try {
      await Participant.update(participantId, { status: "cancelled" });
      await loadSurveyData();
    } catch (error) {
      console.error("Error cancelling participant:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">טוען סקר...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-rose-800 mb-2">הסקר לא נמצא</h2>
            <p className="text-rose-600 mb-6">הסקר שאתה מחפש אולי הועבר או נמחק.</p>
            {isAdmin && (
               <Button asChild className="bg-slate-900 hover:bg-slate-800 rounded-xl">
                  <Link to={createPageUrl("Dashboard")}>
                    <LayoutDashboard className="w-4 h-4 ml-2" />
                    חזור ללוח הבקרה
                  </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (survey.status === 'closed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-rose-800 mb-2">הסקר נסגר</h2>
            <p className="text-rose-600 mb-6">האירוע מלא, לא ניתן לקבל עוד משתתפים/ות.</p>
             {isAdmin && (
               <Button asChild className="bg-slate-900 hover:bg-slate-800 rounded-xl">
                  <Link to={createPageUrl("Dashboard")}>
                    <LayoutDashboard className="w-4 h-4 ml-2" />
                    חזור ללוח הבקרה
                  </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 p-3 sm:p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row-reverse justify-between items-start gap-4">
                <div className="flex-1 text-right">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 text-right">
                    {survey.title}
                  </CardTitle>
                  {survey.description && (
                    <p className="text-slate-600 text-sm sm:text-base mb-4 text-right">
                      {survey.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 justify-end">
                    {survey.location && (
                      <div className="flex items-center gap-1.5 flex-row-reverse">
                        <MapPin className="w-4 h-4" />
                        <span>{survey.location}</span>
                      </div>
                    )}
                    {survey.date && (
                      <div className="flex items-center gap-1.5 flex-row-reverse">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(survey.date).toLocaleDateString('he-IL')}</span>
                      </div>
                    )}
                    {survey.time && (
                      <div className="flex items-center gap-1.5 flex-row-reverse">
                        <Clock className="w-4 h-4" />
                        <span>{survey.time}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-3">
                  <Badge className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 border-rose-200 text-sm px-3 py-1">
                    {participants.length} / {survey.max_participants} מקומות תפוסים
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <div className="flex items-center justify-end gap-3 flex-row-reverse">
                  <Users className="w-5 h-5 text-rose-600" />
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 text-right">
                    בחרו את מקומכם
                  </CardTitle>
                </div>
                <p className="text-slate-600 text-sm sm:text-base mt-2 text-right">
                  לחצו על מקום פנוי כדי להצטרף לאירוע
                </p>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <TableView
                  maxParticipants={survey.max_participants}
                  tableShape={survey.table_shape}
                  participants={participants}
                  onSeatSelect={handleSeatSelect}
                  isAdmin={isAdmin}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <ParticipantList 
              participants={participants}
              isAdmin={isAdmin}
              onCancelParticipant={isAdmin ? handleCancelParticipant : undefined}
            />
          </div>
        </div>

        <ParticipantModal 
          seatNumber={selectedSeat}
          isOpen={showModal}
          onSubmit={handleFormSubmit}
          onClose={handleModalClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

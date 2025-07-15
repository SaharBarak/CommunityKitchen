import React, { useState, useEffect } from "react";
import { EmailTemplate, Survey } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, Edit, Save, Star, Trash2 } from "lucide-react";
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

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const defaultBody = `שלום {name},

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
צוות האירוע`;

  const [formData, setFormData] = useState({
    survey_id: "",
    subject: "",
    body: defaultBody,
    is_default: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesData, surveysData] = await Promise.all([
        EmailTemplate.list("-created_date"),
        Survey.list("-created_date")
      ]);
      setTemplates(templatesData);
      setSurveys(surveysData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      survey_id: "",
      subject: "",
      body: defaultBody,
      is_default: false
    });
    setEditingTemplate(null);
    setShowForm(false);
  };

  const handleEdit = (template) => {
    setFormData(template);
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingTemplate) {
        await EmailTemplate.update(editingTemplate.id, formData);
        toast({
          title: "התבנית עודכנה",
          description: "תבנית האימייל עודכנה בהצלחה.",
        });
      } else {
        await EmailTemplate.create(formData);
        toast({
          title: "התבנית נוצרה",
          description: "תבנית האימייל נוצרה בהצלחה.",
        });
      }

      await loadData();
      resetForm();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן היה לשמור את תבנית האימייל. נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (templateId) => {
    try {
      await EmailTemplate.delete(templateId);
      toast({
        title: "התבנית נמחקה",
        description: "תבנית האימייל הוסרה.",
        variant: "destructive",
      });
      await loadData();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן היה למחוק את תבנית האימייל. נסה שוב.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (templateId) => {
    try {
      const updatePromises = templates.map(t => 
        EmailTemplate.update(t.id, { ...t, is_default: false })
      );
      await Promise.all(updatePromises);

      const template = templates.find(t => t.id === templateId);
      await EmailTemplate.update(templateId, { ...template, is_default: true });

      toast({
        title: "תבנית ברירת מחדל נקבעה",
        description: "תבנית זו היא כעת ברירת המחדל.",
      });
      await loadData();
    } catch (error) {
      console.error("Error setting default template:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן היה לקבוע תבנית ברירת מחדל. נסה שוב.",
        variant: "destructive",
      });
    }
  };

  const getSurveyTitle = (surveyId) => {
    const survey = surveys.find(s => s.id === surveyId);
    return survey ? survey.title : 'לא ידוע';
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">תבניות אימייל</h1>
            <p className="text-slate-600">התאם אישית את אימייל אישור ההזמנה הנשלח למשתתפים</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
          >
            <Plus className="w-4 h-4 ml-2" />
            צור תבנית חדשה
          </Button>
        </div>

        {showForm && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                {editingTemplate ? 'עריכת תבנית' : 'יצירת תבנית חדשה'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="survey_id">שיוך לאירוע (אופציונלי)</Label>
                    <Select 
                      value={formData.survey_id || ""} 
                      onValueChange={(value) => setFormData(prev => ({...prev, survey_id: value}))}
                    >
                      <SelectTrigger className="bg-white/50 border-slate-200 focus:border-slate-400 rounded-xl">
                        <SelectValue placeholder="שיוך לאירוע ספציפי או תבנית כללית" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>תבנית כללית</SelectItem>
                        {surveys.map(survey => (
                          <SelectItem key={survey.id} value={survey.id}>
                            {survey.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Label htmlFor="is_default">הגדר כתבנית ברירת מחדל</Label>
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={formData.is_default}
                      onChange={(e) => setFormData(prev => ({...prev, is_default: e.target.checked}))}
                      className="rounded border-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">נושא האימייל *</Label>
                  <Input
                    id="subject"
                    placeholder="הזמנתך לאירוע {event_title} אושרה!"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({...prev, subject: e.target.value}))}
                    className="bg-white/50 border-slate-200 focus:border-slate-400 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">גוף האימייל *</Label>
                  <Textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({...prev, body: e.target.value}))}
                    className="bg-white/50 border-slate-200 focus:border-slate-400 rounded-xl resize-none"
                    rows={12}
                    required
                  />
                  <p className="text-xs text-slate-500">
                    משתנים זמינים: {"{name}, {event_title}, {event_date}, {event_time}, {event_location}, {seat_number}, {cancellation_link}"}
                  </p>
                   <p className="text-xs text-amber-600">
                    הערה: תבנית זו תשמש גם להודעות אישור וגם לתזכורות אירוע
                  </p>
                </div>

                <div className="flex justify-start gap-3">
                   <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-slate-900 hover:bg-slate-800 rounded-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                        שומר...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 ml-2" />
                        {editingTemplate ? 'עדכן תבנית' : 'צור תבנית'}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
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
              <Mail className="w-5 h-5" />
              תבניות אימייל ({templates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">לא נמצאו תבניות אימייל.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {template.subject}
                          </h3>
                          {template.is_default && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Star className="w-3 h-3 ml-1" />
                              ברירת מחדל
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          {template.survey_id 
                            ? `עבור: ${getSurveyTitle(template.survey_id)}`
                            : 'תבנית כללית'
                          }
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {template.body.substring(0, 150)}...
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!template.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(template.id)}
                            className="hover:bg-yellow-50 hover:border-yellow-200 rounded-xl"
                          >
                            <Star className="w-4 h-4 ml-1" />
                            קבע כברירת מחדל
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          className="hover:bg-slate-100 rounded-xl"
                        >
                          <Edit className="w-4 h-4 ml-1" />
                          ערוך
                        </Button>
                        
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
                            <AlertDialogHeader>
                              <AlertDialogTitle>מחיקת תבנית אימייל</AlertDialogTitle>
                              <AlertDialogDescription>
                                האם אתה בטוח שברצונך למחוק תבנית זו? לא ניתן לשחזר פעולה זו.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ביטול</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(template.id)}>
                                מחק תבנית
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
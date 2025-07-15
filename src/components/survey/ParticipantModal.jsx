
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ParticipantModal({ 
  seatNumber, 
  isOpen, 
  onSubmit, 
  onClose, 
  isSubmitting,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: "", email: "", phone: "" });
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", phone: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-md bg-white border-0 shadow-xl rounded-xl text-right"
        dir="rtl"
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-3 flex-row-reverse text-right">
            <User className="w-5 h-5 text-blue-600" />
            {`הזמנת מקום #${seatNumber}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700 text-right">
              שם מלא *
            </Label>
            <Input
              id="name"
              placeholder="הכניסו שם מלא"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-white border-slate-200 focus:border-blue-400 rounded-lg text-right"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700 text-right">
              כתובת אימייל *
            </Label>
            <div className="relative">
              <Mail className="absolute top-3 right-3 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-white border-slate-200 focus:border-blue-400 rounded-lg pr-10"
                required
                dir="ltr"
              />
            </div>
            <p className="text-xs text-slate-500 text-right">
              נדרש לקבלת אישור וקישור לביטול
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700 text-right">
              מספר טלפון
            </Label>
            <div className="relative">
              <Phone className="absolute top-3 right-3 w-4 h-4 text-slate-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="050-123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="bg-white border-slate-200 focus:border-blue-400 rounded-lg pr-10 text-right"
              />
            </div>
            <p className="text-xs text-slate-500 text-right">
              אופציונלי - לעדכונים על האירוע
            </p>
          </div>

          <div className="flex gap-3 pt-4 flex-row-reverse">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg"
            >
              ביטול
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.email}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  מבצע הזמנה...
                </>
              ) : (
                'הזמינו מקום'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

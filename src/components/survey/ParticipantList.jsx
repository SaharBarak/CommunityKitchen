
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Lock } from "lucide-react";

export default function ParticipantList({ participants, isAdmin = false }) {
  // Only show confirmed participants
  const activeParticipants = participants.filter(p => p.status === 'confirmed');
  const sortedParticipants = [...activeParticipants].sort((a, b) => a.seat_number - b.seat_number);

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl" dir="rtl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 flex-row-reverse">
          <Users className="w-5 h-5 text-rose-600" />
          <CardTitle className="text-lg font-bold text-slate-900">
            משתתפים/ות ({activeParticipants.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {activeParticipants.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-sm">
              אין עדיין משתתפים/ות.
              <br />
              <span className="text-rose-600 font-medium">מוזמנים/ות להירשם!</span>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {isAdmin ? (
              sortedParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg flex-row-reverse"
                >
                  <Badge 
                    variant="outline" 
                    className="bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800 border-sky-200 font-medium"
                  >
                    #{participant.seat_number}
                  </Badge>
                  <div className="flex-1 min-w-0 flex flex-col text-right">
                    <p className="font-medium text-slate-900 truncate">
                      {participant.name}
                    </p>
                    {participant.email && (
                      <p className="text-xs text-slate-700 truncate">
                        אימייל: <a href={`mailto:${participant.email}`} className="underline hover:text-blue-700">{participant.email}</a>
                      </p>
                    )}
                    {participant.phone && (
                      <p className="text-xs text-slate-700 truncate">
                        טלפון: {participant.phone}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="relative">
                <div className="filter blur-sm pointer-events-none">
                  {sortedParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg mb-3 flex-row-reverse"
                    >
                      <Badge 
                        variant="outline" 
                        className="bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800 border-sky-200 font-medium"
                      >
                        #{participant.seat_number}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          שם משתתף
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
                  <div className="text-center">
                    <Lock className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">
                      פרטי המשתתפים/ות חסויים
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

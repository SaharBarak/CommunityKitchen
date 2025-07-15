
import React from "react";

export default function TableView({ maxParticipants, tableShape, participants, onSeatSelect, isAdmin = false }) {
  
  const isOccupied = (seatNumber) => {
    // Only consider confirmed participants as occupying seats
    return participants.some(p => p.seat_number === seatNumber && p.status === 'confirmed');
  };

  const getParticipantName = (seatNumber) => {
    // Only show names for confirmed participants
    const participant = participants.find(p => p.seat_number === seatNumber && p.status === 'confirmed');
    return participant ? participant.name : '';
  };

  const seats = [];
  for (let i = 1; i <= maxParticipants; i++) {
    seats.push(i);
  }

  const getSeatStyle = (seatNumber) => {
    const angle = (360 / maxParticipants) * (seatNumber - 1) - 90;
    const radius = 90;
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;
    
    return {
      position: 'absolute',
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: 'translate(-50%, -50%)'
    };
  };

  return (
    <div className="w-full flex justify-center p-8">
      <div className="relative w-64 h-64">
        
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-200 border-4 border-orange-300 rounded-full shadow-lg"
          style={{ width: '80px', height: '80px' }}
        />

        {seats.map((seatNumber) => {
          const occupied = isOccupied(seatNumber);
          const participantName = getParticipantName(seatNumber);

          return (
            <button
              key={seatNumber}
              style={getSeatStyle(seatNumber)}
              onClick={() => !occupied && onSeatSelect(seatNumber)}
              disabled={occupied}
              className={`
                w-12 h-12 rounded-full font-bold text-xs shadow-md transition-all duration-200
                ${occupied 
                  ? 'bg-green-400 text-white cursor-default' 
                  : 'bg-blue-400 text-white hover:bg-blue-500 hover:scale-110 cursor-pointer'
                }
              `}
            >
              <div className="text-center">
                <div>#{seatNumber}</div>
                {occupied ? (
                  <div className="text-[8px] truncate">
                    {isAdmin ? participantName.split(' ')[0] : 'תפוס'}
                  </div>
                ) : (
                  <div className="text-[8px]">זמין</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


import React from 'react';
import { Session, Review } from '../types';

interface SessionCardProps {
  session: Session;
  onJoin?: (id: string) => void;
  onSelect?: (session: Session) => void;
  isExpertiseMatch?: boolean;
  reviews: Review[];
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onJoin, onSelect, isExpertiseMatch, reviews }) => {
  const isNow = session.status === 'NOW' || session.status === 'LIVE';
  const hasLink = !!session.zoomLink && session.zoomLink.trim() !== '';
  
  const categoryColor = session.category === 'Career' ? 'text-[#C5A059] bg-[#C5A059]/10' : 'text-[#7FB5B5] bg-[#7FB5B5]/10';

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLink) {
      window.open(session.zoomLink, '_blank', 'noopener,noreferrer');
      onJoin?.(session.id);
    }
  };

  return (
    <div 
      onClick={() => onSelect?.(session)}
      className="glass-card p-6 rounded-[2.5rem] shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(26,34,56,0.12)] hover:scale-[1.025] hover:-translate-y-2.5 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group flex flex-col h-full border border-gray-100/50 animate-in opacity-0 cursor-pointer relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#7FB5B5]/5 to-transparent rounded-full -translate-x-16 -translate-y-16 group-hover:scale-[2] transition-transform duration-1000"></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`${categoryColor} text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-all duration-500 group-hover:bg-white group-hover:shadow-sm`}>
            {session.category}
          </span>
          {isExpertiseMatch && (
            <div className="flex items-center gap-1.5 bg-[#C5A059]/10 border border-[#C5A059]/20 px-2 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#C5A059" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span className="text-[8px] font-bold text-[#C5A059] uppercase tracking-tighter">Match</span>
            </div>
          )}
          {averageRating && (
             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C5A059]/5 border border-[#C5A059]/10">
               <span className="text-[10px] font-bold text-[#C5A059]">{averageRating}</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#C5A059" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
               <span className="text-[8px] text-gray-400 font-medium">({reviews.length})</span>
             </div>
          )}
        </div>
        <span className={`text-[10px] font-mono font-bold tracking-tight ${isNow ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
          {session.timeLabel}
        </span>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-xl mb-3 font-bold font-playfair leading-tight text-[#1A2238] group-hover:text-[#7FB5B5] transition-colors duration-300">
          {session.title}
        </h3>
        
        <p className="text-sm text-gray-500 mb-6 line-clamp-2 font-light leading-relaxed group-hover:text-gray-600 transition-colors duration-500">
          {session.description}
        </p>

        {hasLink && (
          <div className="flex items-center gap-2 mb-6 bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100/50 group-hover:bg-white group-hover:border-[#7FB5B5]/20 transition-all duration-500">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="text-[9px] font-mono text-gray-400 truncate max-w-[200px]">
              {session.zoomLink}
            </span>
          </div>
        )}
      </div>

      <div className="mt-auto relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative overflow-hidden rounded-full">
            <img 
              src={session.avatarUrl} 
              alt={session.mentorName} 
              className="w-12 h-12 rounded-full border-2 border-transparent group-hover:border-[#7FB5B5]/20 object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
            />
          </div>
          <div className="group-hover:translate-x-1.5 transition-transform duration-500">
            <p className="text-xs font-bold text-[#1A2238]">{session.mentorName}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
              {session.mentorInst}
            </p>
          </div>
        </div>

        <button 
          disabled={!hasLink}
          onClick={handleJoinClick}
          className={`w-full py-4 rounded-2xl text-[10px] uppercase tracking-[0.25em] font-bold transition-all duration-500 transform active:scale-95 flex items-center justify-center gap-2 ${
            isNow 
              ? 'bg-[#1A2238] text-white shadow-[#1A2238]/20 shadow-xl hover:bg-[#7FB5B5] group-hover:-translate-y-1' 
              : 'border border-[#1A2238] text-[#1A2238] hover:bg-[#1A2238] hover:text-white'
          } ${!hasLink ? 'opacity-30 cursor-not-allowed grayscale border-gray-200 text-gray-400' : ''}`}
        >
          {hasLink ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform duration-500"><path d="M15.6 11.6L22 7v10l-6.4-4.6v-0.8z"/><rect x="2" y="6" width="12" height="12" rx="2"/></svg>
              Join Masterclass
            </>
          ) : (
            'Link Pending'
          )}
        </button>
      </div>
    </div>
  );
};

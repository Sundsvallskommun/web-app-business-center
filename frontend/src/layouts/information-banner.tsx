 'use client';
 
 
 export function InformationBanner() {
   return (
     <div
       className="w-full bg-error-surface-accent flex items-center justify-center py-10 min-h-[6rem] sk-header"
       role="region"
       aria-label="Informationsmeddelande"
     >
       <div className="max-w-[128rem] justify-center flex-grow">
         <p className="text-base">
            På onsdag den 12/11 mellan 20:00-21:00 kommer systemunderhåll att ske, vilket kan påverka tillgängligheten av tjänsten under kortare perioder.
         </p>
       </div>
     </div>
   );
 }

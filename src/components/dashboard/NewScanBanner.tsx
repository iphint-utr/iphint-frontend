import React from 'react';
import { ArrowRight, ScanLine } from 'lucide-react'; // Assuming you use lucide-react for icons

export const NewScanBanner: React.FC<{ t: any }> = ({ t }) => (
  <div className="bg-[#8b5cf6] rounded-xl p-8 text-white flex justify-between items-center shadow-md">
    <div>
      <h2 className="text-2xl font-bold mb-2">{t('startScanTitle')}</h2>
      <p className="text-purple-100 mb-6 text-sm">{t('startScanSub')}</p>
      <button className="bg-white text-[#8b5cf6] px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors">
        {t('uploadBtn')} <ArrowRight size={16} />
      </button>
    </div>
    <div className="hidden sm:block opacity-20">
      <ScanLine size={100} />
    </div>
  </div>
);
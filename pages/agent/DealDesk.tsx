import React from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';

const DealDesk: React.FC = () => {
  const stages = [
    { id: 'new', title: 'New Leads', color: 'bg-slate-100' },
    { id: 'showing', title: 'Showings', color: 'bg-blue-50' },
    { id: 'negotiation', title: 'Negotiation', color: 'bg-purple-50' },
    { id: 'contract', title: 'Under Contract', color: 'bg-indigo-50' },
    { id: 'closed', title: 'Closed', color: 'bg-emerald-50' },
  ];

  const deals = [
    { id: 1, name: 'Smith - 123 Main', value: '$450k', stage: 'contract', health: 'good', stalled: false },
    { id: 2, name: 'Jones Purchase', value: '$850k', stage: 'negotiation', health: 'critical', stalled: true },
    { id: 3, name: 'Miller Listing', value: '$620k', stage: 'showing', health: 'good', stalled: false },
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Deal Desk</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus size={18} /> New Deal
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-[1000px]">
          {stages.map(stage => (
            <div key={stage.id} className="w-80 flex flex-col bg-slate-50/50 rounded-xl border border-slate-200">
              <div className={`p-4 border-b border-slate-100 font-semibold text-sm flex justify-between items-center ${stage.color} rounded-t-xl`}>
                {stage.title}
                <span className="text-slate-400 text-xs font-normal">
                  {deals.filter(d => d.stage === stage.id).length}
                </span>
              </div>
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {deals.filter(d => d.stage === stage.id).map(deal => (
                  <div key={deal.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow relative group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-slate-800">{deal.name}</span>
                      <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                    </div>
                    <div className="text-sm text-slate-500 mb-3">{deal.value}</div>
                    
                    <div className="flex items-center gap-2">
                      {deal.stalled && (
                        <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded font-bold">
                          STALLED
                        </span>
                      )}
                      {deal.health === 'critical' && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Critical Health" />
                      )}
                      {deal.health === 'good' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Good Health" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealDesk;

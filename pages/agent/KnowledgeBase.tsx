
import React, { useState } from 'react';
import { BookOpen, Search, Plus, Edit2, Trash2, Save, BrainCircuit, MessageSquare, Check, RefreshCw } from 'lucide-react';
import { ScriptObjection } from '../../types';

const KnowledgeBase: React.FC = () => {
  const [scripts, setScripts] = useState<ScriptObjection[]>([
    {
      id: '1',
      category: 'Commission',
      triggerPhrases: ['fees are too high', 'reduce commission', '3 percent', 'cheaper agent'],
      coreResponse: "I understand that maximizing your net proceeds is the goal. My fee covers professional staging, 3D tours, and targeted social ad spend which historically sells homes for 4% more than market average. If we cut the commission, we cut the marketing that finds the highest bidder.",
      successRate: 85,
      usageCount: 142
    },
    {
      id: '2',
      category: 'Timing',
      triggerPhrases: ['just looking', 'not ready yet', 'waiting for spring', 'market crash'],
      coreResponse: "That makes sense. The market is shifting. However, inventory is currently at historic lows in your price point, meaning less competition for you right now. If we wait for Spring, you'll be competing with 3x more listings.",
      successRate: 72,
      usageCount: 98
    },
    {
      id: '3',
      category: 'Competition',
      triggerPhrases: ['interviewing other agents', 'friend is a realtor', 'family member agent'],
      coreResponse: "It's smart to interview multiple agents. When you speak with them, ask about their specific 'List-to-Sale' price ratio. My average is 102%, meaning I consistently get sellers over asking price. Does your friend have that track record?",
      successRate: 68,
      usageCount: 45
    }
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ScriptObjection>>({});
  const [isTraining, setIsTraining] = useState(false);

  const handleEdit = (script: ScriptObjection) => {
    setEditingId(script.id);
    setEditForm(script);
  };

  const handleSave = () => {
    setScripts(prev => prev.map(s => s.id === editingId ? { ...s, ...editForm } as ScriptObjection : s));
    setEditingId(null);
    setEditForm({});
  };

  const handleTrainAI = () => {
    setIsTraining(true);
    setTimeout(() => {
      setIsTraining(false);
      alert("Vector Database updated with new scripts. The AI Copilot will now use these responses.");
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Objection Scripts</h2>
          <p className="text-slate-500">Train the AI Copilot to handle difficult conversations.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleTrainAI}
            disabled={isTraining}
            className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 flex items-center gap-2"
          >
            {isTraining ? <RefreshCw className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
            Retrain AI Model
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
            <Plus size={16} /> Add Script
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search scripts..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BookOpen size={16} /> <span>{scripts.length} Active Scripts</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {scripts.map(script => (
            <div key={script.id} className="p-6 hover:bg-slate-50 transition-colors group">
              {editingId === script.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                      <input 
                        className="w-full p-2 border border-slate-200 rounded-md" 
                        value={editForm.category}
                        onChange={e => setEditForm({...editForm, category: e.target.value as any})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Trigger Phrases (comma sep)</label>
                      <input 
                        className="w-full p-2 border border-slate-200 rounded-md" 
                        value={editForm.triggerPhrases?.join(', ')}
                        onChange={e => setEditForm({...editForm, triggerPhrases: e.target.value.split(',').map(s => s.trim())})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Best Practice Response</label>
                    <textarea 
                      className="w-full p-3 border border-slate-200 rounded-md h-24 text-sm"
                      value={editForm.coreResponse}
                      onChange={e => setEditForm({...editForm, coreResponse: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-slate-500 text-sm font-bold">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                      <Save size={14} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        script.category === 'Commission' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        script.category === 'Timing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-orange-50 text-orange-700 border-orange-100'
                      }`}>
                        {script.category}
                      </span>
                      <span className="text-xs text-slate-400">Triggers: {script.triggerPhrases.slice(0,3).join(', ')}...</span>
                    </div>
                    <p className="text-slate-800 text-sm leading-relaxed mb-3">"{script.coreResponse}"</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-emerald-600">
                        <Check size={12} /> {script.successRate}% Success Rate
                      </span>
                      <span>Used {script.usageCount} times</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(script)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;


import React, { useState } from 'react';
import { 
    Users, Plus, Search, Settings, Globe, Lock, EyeOff, 
    ChevronRight, Check, Image as ImageIcon, Sparkles, 
    Mic, Shield, Hash, ArrowLeft, Loader2, LogOut, MessageSquare
} from 'lucide-react';
import { useGroups } from '../GroupContext';
import { useChat } from '../ChatContext';
import { Group, ViewState, User } from '../types';
import { USERS } from '../constants';
import GroupMembersModal from '../components/GroupMembersModal';

interface GroupsProps {
    onNavigate?: (view: ViewState) => void;
    onUserClick?: (user: User) => void;
}

const CreateGroupWizard = ({ onClose }: { onClose: () => void }) => {
    const { createGroup, isLoading } = useGroups();
    const [step, setStep] = useState(1);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Social',
        privacy: 'public' as 'public' | 'private' | 'secret',
        approvalRequired: false,
        aiEnabled: false,
        voiceRoom: true,
        theme: 'default',
        coverUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
        selectedMembers: [] as string[]
    });

    const handleCreate = async () => {
        await createGroup({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            privacy: formData.privacy,
            aiEnabled: formData.aiEnabled,
            voiceRoomActive: formData.voiceRoom,
            coverUrl: formData.coverUrl
        });
        setStep(5); // Success Screen
    };

    const renderStep1_Info = () => (
        <div className="space-y-6 animate-slide-up">
            <div className="flex justify-center">
                <div className="relative w-32 h-24 rounded-2xl overflow-hidden group cursor-pointer border-2 border-dashed border-gray-300 dark:border-neutral-600 hover:border-primary-500">
                    <img src={formData.coverUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">Group Name</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-100 dark:bg-neutral-900 p-4 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-primary-500 font-bold text-lg transition"
                        placeholder="e.g. React Ninjas" 
                    />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">Description</label>
                    <textarea 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-gray-100 dark:bg-neutral-900 p-4 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-primary-500 h-24 resize-none transition"
                        placeholder="What's this community about?" 
                    />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">Category</label>
                    <div className="flex space-x-2 mt-2 overflow-x-auto no-scrollbar">
                        {['Social', 'Tech', 'Business', 'Gaming', 'Art'].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setFormData({...formData, category: cat})}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${formData.category === cat ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' : 'border-gray-200 dark:border-neutral-800 text-gray-500'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2_Privacy = () => (
        <div className="space-y-4 animate-slide-up">
            {[
                { id: 'public', label: 'Public Group', desc: 'Anyone can find and join.', icon: Globe },
                { id: 'private', label: 'Private Group', desc: 'Anyone can find, but needs approval.', icon: Lock },
                { id: 'secret', label: 'Secret Group', desc: 'Hidden from search. Invite only.', icon: EyeOff },
            ].map((opt) => (
                <div 
                    key={opt.id}
                    onClick={() => setFormData({...formData, privacy: opt.id as any})}
                    className={`p-4 rounded-xl border-2 cursor-pointer flex items-center space-x-4 transition ${formData.privacy === opt.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800'}`}
                >
                    <div className={`p-3 rounded-full ${formData.privacy === opt.id ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-500'}`}>
                        <opt.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{opt.label}</h3>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderStep3_Advanced = () => (
         <div className="space-y-4 animate-slide-up">
            <div className="p-5 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                        <div>
                            <h3 className="font-bold">VoxNet AI Bot</h3>
                            <p className="text-xs text-white/80">Auto-summaries, translation & moderation.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setFormData({...formData, aiEnabled: !formData.aiEnabled})}
                        className={`w-12 h-6 rounded-full relative transition-colors ${formData.aiEnabled ? 'bg-white' : 'bg-white/30'}`}
                    >
                         <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${formData.aiEnabled ? 'bg-violet-600 right-1' : 'bg-white left-1'}`} />
                    </button>
                </div>
            </div>

            <div className="p-4 border border-gray-100 dark:border-neutral-800 rounded-xl flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                        <Mic className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm dark:text-white">Voice Room</h3>
                        <p className="text-xs text-gray-500">Permanent audio channel for hangouts.</p>
                    </div>
                </div>
                <input type="checkbox" checked={formData.voiceRoom} onChange={() => setFormData({...formData, voiceRoom: !formData.voiceRoom})} className="accent-green-500 w-5 h-5" />
            </div>
         </div>
    );

    const renderStep4_Participants = () => (
         <div className="h-full flex flex-col animate-slide-up">
             <div className="relative mb-4">
                 <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                 <input type="text" placeholder="Search friends..." className="w-full bg-gray-100 dark:bg-neutral-900 rounded-xl py-2 pl-10 text-sm outline-none dark:text-white" />
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-2">
                 {USERS.slice(1).map(user => {
                     const isSelected = formData.selectedMembers.includes(user.id);
                     return (
                         <div 
                            key={user.id} 
                            onClick={() => {
                                if (isSelected) setFormData({...formData, selectedMembers: formData.selectedMembers.filter(id => id !== user.id)});
                                else setFormData({...formData, selectedMembers: [...formData.selectedMembers, user.id]});
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-neutral-900'}`}
                        >
                             <div className="flex items-center space-x-3">
                                 <img src={user.avatar} className="w-10 h-10 rounded-full" />
                                 <span className="font-bold text-sm dark:text-white">{user.name}</span>
                             </div>
                             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                                 {isSelected && <Check className="w-4 h-4 text-white" />}
                             </div>
                         </div>
                     )
                 })}
             </div>
         </div>
    );

    const renderStep5_Success = () => (
        <div className="flex flex-col items-center justify-center h-full animate-scale-up text-center p-6">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/40">
                <Check className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Group Created!</h2>
            <p className="text-gray-500 mb-8">"{formData.name}" is ready for action.</p>
            
            <button onClick={onClose} className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg mb-3">Go to Group</button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-black w-full max-w-md h-[650px] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-neutral-800">
                {step < 5 && (
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">Cancel</button>
                        <div className="flex space-x-2">
                            {[1,2,3,4].map(s => (
                                <div key={s} className={`w-2 h-2 rounded-full transition-all ${step >= s ? 'bg-primary-500 w-4' : 'bg-gray-200 dark:bg-neutral-800'}`} />
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="flex-1 p-6 overflow-y-auto">
                    {step === 1 && renderStep1_Info()}
                    {step === 2 && renderStep2_Privacy()}
                    {step === 3 && renderStep3_Advanced()}
                    {step === 4 && renderStep4_Participants()}
                    {step === 5 && renderStep5_Success()}
                </div>

                {step < 5 && (
                    <div className="p-6 border-t border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
                        <button 
                            onClick={() => {
                                if (step === 4) handleCreate();
                                else setStep(s => s + 1);
                            }}
                            disabled={(step === 1 && !formData.name) || isLoading}
                            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold flex justify-center items-center disabled:opacity-50 transition"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (step === 4 ? 'Create Group' : 'Next')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const GroupSkeleton = () => (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800 shadow-sm">
        <div className="h-32 bg-gray-200 dark:bg-neutral-800 animate-pulse" />
        <div className="p-4">
            <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-1/2 mb-4 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-full animate-pulse" />
        </div>
    </div>
);

const Groups: React.FC<GroupsProps> = ({ onNavigate, onUserClick }) => {
    const { myGroups, publicGroups, joinGroup, leaveGroup, isLoading } = useGroups();
    const { openGroupChat } = useChat();
    const [activeTab, setActiveTab] = useState<'my' | 'explore'>('my');
    const [showCreateWizard, setShowCreateWizard] = useState(false);
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [viewingGroup, setViewingGroup] = useState<Group | null>(null);

    const handleJoin = async (group: Group) => {
        setJoiningId(group.id);
        await joinGroup(group.id);
        setJoiningId(null);
        openGroupChat(group);
        if (onNavigate) onNavigate(ViewState.MESSAGES);
    };

    const handleOpen = (group: Group) => {
        openGroupChat(group);
        if (onNavigate) onNavigate(ViewState.MESSAGES);
    };

    const GroupCard: React.FC<{ group: Group }> = ({ group }) => {
        const isMember = group.role !== 'none';
        const isProcessing = joiningId === group.id;

        return (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition group-card animate-fade-in flex flex-col">
                <div 
                    className="h-32 bg-gray-200 relative cursor-pointer" 
                    onClick={() => setViewingGroup(group)}
                >
                    <img src={group.coverUrl} className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md uppercase">
                        {group.privacy}
                    </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 
                            className="font-bold text-lg dark:text-white leading-tight truncate cursor-pointer hover:text-primary-500 transition-colors"
                            onClick={() => setViewingGroup(group)}
                        >
                            {group.name}
                        </h3>
                        {group.role === 'admin' && <span className="bg-primary-500/10 text-primary-500 text-[10px] font-bold px-1.5 py-0.5 rounded">ADMIN</span>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 min-h-[2.5em]">{group.description}</p>
                    
                    <div className="flex items-center justify-between border-t border-gray-50 dark:border-neutral-800 pt-3 mt-auto mb-3">
                        <div className="flex items-center text-xs text-gray-500">
                            <Users className="w-3 h-3 mr-1" />
                            {group.membersCount.toLocaleString()}
                        </div>
                        {group.aiEnabled && <Sparkles className="w-3 h-3 text-violet-500" />}
                    </div>
                    
                    {isMember ? (
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => handleOpen(group)}
                                className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 flex items-center justify-center space-x-2"
                            >
                                <MessageSquare className="w-3 h-3" />
                                <span>Open Chat</span>
                            </button>
                            <button 
                                onClick={() => leaveGroup(group.id)}
                                className="px-3 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => handleJoin(group)}
                            disabled={isProcessing}
                            className="w-full py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-bold hover:opacity-90 flex items-center justify-center space-x-2"
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Join Group</span>}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-black overflow-y-auto pb-20">
            {showCreateWizard && <CreateGroupWizard onClose={() => setShowCreateWizard(false)} />}
            
            {/* Group Members Modal */}
            {viewingGroup && onUserClick && (
                <GroupMembersModal 
                    group={viewingGroup} 
                    onClose={() => setViewingGroup(null)} 
                    onUserClick={onUserClick} 
                />
            )}

            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Groups</h1>
                <div className="flex space-x-3">
                    <button className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full"><Search className="w-5 h-5 dark:text-white" /></button>
                    <button onClick={() => setShowCreateWizard(true)} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg shadow-primary-600/30 hover:scale-105 transition">
                        <Plus className="w-4 h-4 mr-2" />
                        Create
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="px-4 py-4 flex space-x-2">
                <button
                    onClick={() => setActiveTab('my')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'my' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-neutral-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-neutral-800'}`}
                >
                    My Groups
                </button>
                <button
                    onClick={() => setActiveTab('explore')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'explore' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-neutral-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-neutral-800'}`}
                >
                    Explore Public
                </button>
            </div>

            {/* Content */}
            <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    // Skeletons
                    Array.from({ length: 4 }).map((_, i) => <GroupSkeleton key={i} />)
                ) : (
                    activeTab === 'my' ? (
                        myGroups.length > 0 ? (
                            myGroups.map(group => <GroupCard key={group.id} group={group} />)
                        ) : (
                            <div className="col-span-full py-20 text-center flex flex-col items-center opacity-50">
                                <Users className="w-16 h-16 text-gray-400 mb-4" />
                                <p className="text-lg font-bold">You haven't joined any groups yet.</p>
                                <button onClick={() => setActiveTab('explore')} className="mt-2 text-primary-600 font-bold hover:underline">Explore Communities</button>
                            </div>
                        )
                    ) : (
                        publicGroups.map(group => <GroupCard key={group.id} group={group} />)
                    )
                )}
            </div>
            
            {activeTab === 'explore' && !isLoading && (
                <div className="px-4 mt-8 pb-10">
                    <h3 className="font-bold text-lg dark:text-white mb-4 flex items-center"><Hash className="w-5 h-5 mr-2" /> Trending Topics</h3>
                    <div className="flex flex-wrap gap-2">
                        {['#Web3', '#Photography', '#Pets', '#StartupLife', '#Gaming', '#MusicProduction'].map(tag => (
                            <span key={tag} className="px-3 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary-500 cursor-pointer transition">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;

import React, { useState } from 'react';
import { X, User, Phone, Check, Edit3 } from 'lucide-react';
import { CustomerProfile } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: CustomerProfile;
  onSave: (updated: { name: string; phone: string }) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave
}) => {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), phone: phone.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#0D1536] border border-indigo-900 rounded-3xl p-5 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-bold text-white flex items-center gap-2 text-base">
            <Edit3 className="w-4 h-4 text-purple-400" />
            <span>Edit Profile</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Name"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#141E47] border border-indigo-800 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Mobile Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-2.5 rounded-xl bg-[#141E47] border border-indigo-800 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 active:scale-95 text-gray-950 font-bold text-sm shadow-lg transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

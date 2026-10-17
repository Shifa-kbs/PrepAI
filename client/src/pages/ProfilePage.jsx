import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, GraduationCap, Code2, FileText, Calendar, Save, Info } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    college: user?.profile?.college || '',
    degree: user?.profile?.degree || '',
    graduationYear: user?.profile?.graduationYear || '',
    skills: user?.profile?.skills ? user.profile.skills.join(', ') : '',
    bio: user?.profile?.bio || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Update local context user state for immediate feedback
    const updatedUser = {
      ...user,
      name: formData.name,
      profile: {
        ...user?.profile,
        college: formData.college,
        degree: formData.degree,
        graduationYear: formData.graduationYear ? Number(formData.graduationYear) : undefined,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        bio: formData.bio,
      },
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    toast.success('Local profile updated. Note: Backend update endpoint will be added in a future phase.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal information, education, skills, and interview background
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <User className="w-4 h-4 text-brand-400" />
          <span className="capitalize">{user?.role || 'Student'} Account</span>
        </div>
      </div>

      {/* Backend endpoint notice banner */}
      <div className="p-4 bg-brand-950/40 border border-brand-500/30 rounded-xl flex items-start space-x-3 text-xs text-brand-200">
        <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-100">Phase 1 Profile Endpoint Note</p>
          <p className="text-slate-300 leading-relaxed">
            The Phase 1 backend provides <code className="bg-slate-900 px-1.5 py-0.5 rounded text-brand-300 font-mono">GET /api/auth/me</code> to authenticate and load profile data. A backend update route (<code className="bg-slate-900 px-1.5 py-0.5 rounded text-brand-300 font-mono">PUT /api/auth/profile</code>) will be integrated in a future phase.
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <Card>
        <form onSubmit={handleSave} className="space-y-6">
          {/* Account Basics */}
          <div>
            <h2 className="text-sm font-bold text-slate-200 mb-4 pb-2 border-b border-slate-800">
              Account Credentials
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={User}
                required
              />
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                disabled
                icon={Mail}
                helperText="Email address cannot be changed"
              />
            </div>
          </div>

          {/* Education Details */}
          <div>
            <h2 className="text-sm font-bold text-slate-200 mb-4 pb-2 border-b border-slate-800">
              Education & Background
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <Input
                  label="College / University"
                  name="college"
                  placeholder="e.g. Stanford University"
                  value={formData.college}
                  onChange={handleChange}
                  icon={GraduationCap}
                />
              </div>
              <div>
                <Input
                  label="Degree / Major"
                  name="degree"
                  placeholder="e.g. B.S. Computer Science"
                  value={formData.degree}
                  onChange={handleChange}
                  icon={GraduationCap}
                />
              </div>
              <div>
                <Input
                  label="Graduation Year"
                  type="number"
                  name="graduationYear"
                  placeholder="e.g. 2026"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  icon={Calendar}
                />
              </div>
            </div>
          </div>

          {/* Skills & Bio */}
          <div>
            <h2 className="text-sm font-bold text-slate-200 mb-4 pb-2 border-b border-slate-800">
              Skills & Bio
            </h2>
            <div className="space-y-4">
              <Input
                label="Technical Skills (Comma Separated)"
                name="skills"
                placeholder="e.g. Data Structures, React, Node.js, Python, System Design"
                value={formData.skills}
                onChange={handleChange}
                icon={Code2}
                helperText="Separate skills with commas"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Bio / Target Roles
                </label>
                <div className="relative">
                  <textarea
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Brief description of your interview preparation goals..."
                    className="block w-full rounded-lg bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm p-3 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <Button type="submit" variant="primary" icon={Save}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;

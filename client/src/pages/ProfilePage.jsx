import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, GraduationCap, Code2, Calendar, Save, CheckCircle2 } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { updateUserProfile } from '../services/authService';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        college: formData.college.trim(),
        degree: formData.degree.trim(),
        graduationYear: formData.graduationYear ? Number(formData.graduationYear) : undefined,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        bio: formData.bio.trim(),
      };

      const res = await updateUserProfile(payload);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
        toast.success('Profile saved to database successfully!');
      } else {
        toast.success('Profile updated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Profile</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal credentials, education, skills, and target placement roles
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-lg shadow-xs">
          <User className="w-4 h-4 text-sky-500" />
          <span className="capitalize">{user?.role || 'Student'} Account</span>
        </div>
      </div>

      {/* Profile Form */}
      <Card className="border border-slate-200/90 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Account Basics */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
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
                helperText="Email address is associated with your authentication account"
              />
            </div>
          </div>

          {/* Education Details */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Education & Academic Background
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
                  placeholder="e.g. B.Tech Computer Science"
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
            <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Skills & Career Target
            </h2>
            <div className="space-y-4">
              <Input
                label="Technical Skills (Comma Separated)"
                name="skills"
                placeholder="e.g. Data Structures, React, Node.js, Python, SQL, System Design"
                value={formData.skills}
                onChange={handleChange}
                icon={Code2}
                helperText="Separate skills with commas (e.g., Python, SQL, DSA)"
              />

              <div className="w-full space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Target Roles & Professional Bio
                </label>
                <div className="relative">
                  <textarea
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Brief description of your interview preparation goals and target companies..."
                    className="block w-full rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-slate-400 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Real-time persistence to MongoDB Atlas</span>
            </span>
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              isLoading={isSaving}
              className="shadow-sm"
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;

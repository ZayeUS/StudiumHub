// src/frontend/components/onboarding/ProfileStep.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { PersonStanding, Camera, Edit, ArrowRight, Loader2, ShieldCheck, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getData } from '../../utils/BackendRequestHelper';
import { useUserStore } from '../../store/userStore';

const panelSwap = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 220, damping: 26 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.18 } },
};

const AvatarWithPresignedUrl = ({ profile, preview, className = "w-full h-full" }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preview) {
      setAvatarUrl(preview);
      return;
    }

    if (!profile?.avatar_url) {
      setAvatarUrl(null);
      return;
    }

    const fetchAvatarUrl = async () => {
      setLoading(true);
      try {
        const { url } = await getData('/profile/avatar/view');
        setAvatarUrl(url);
      } catch (error) {
        console.error('Failed to get avatar URL:', error);
        setAvatarUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarUrl();
  }, [profile?.avatar_url, preview]);

  return (
    <Avatar className={className}>
      <AvatarImage src={avatarUrl || undefined} alt="User avatar" />
      <AvatarFallback>
        {loading ? <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" /> : <PersonStanding className="w-12 h-12 text-muted-foreground" />}
      </AvatarFallback>
    </Avatar>
  );
};

const PhotoUpload = ({ onFileSelect, loading, profile }) => {
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    onFileSelect(file);
    return () => URL.revokeObjectURL(previewUrl);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    multiple: false,
    disabled: loading,
  });

  const hasAvatar = preview || profile?.avatar_url;

  return (
    <div className="flex flex-col items-center">
      <div
        {...getRootProps()}
        className={cn(
          'relative w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all',
          isDragActive ? 'border-primary bg-primary/10' : 'border-border',
          loading && 'opacity-70 pointer-events-none'
        )}
        aria-label="Upload profile photo"
      >
        <input {...getInputProps()} />
        <AvatarWithPresignedUrl profile={profile} preview={preview} className="w-full h-full" />
        <div className={cn('absolute inset-0 w-full h-full bg-black/50 text-white flex flex-col items-center justify-center rounded-full transition-opacity', hasAvatar ? 'opacity-0 hover:opacity-100' : 'opacity-100')}>
          {hasAvatar ? <Edit /> : <Camera />}
          <p className="text-xs mt-1">{hasAvatar ? 'Change' : 'Upload'}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">Optional, but recommended.</p>
    </div>
  );
};
  
export const ProfileStep = ({ onProfileComplete, loading, profile }) => {
  const { organization } = useUserStore();
  const [form, setForm] = useState({ 
    first_name: profile?.first_name || '', 
    last_name: profile?.last_name || '',
    organization_name: organization?.name || ''
  });
  const [errors, setErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required.';
    if (!form.last_name.trim()) errs.last_name = 'Last name is required.';
    if (!form.organization_name.trim()) errs.organization_name = 'Organization name is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onProfileComplete(form, avatarFile);
  };

  return (
    <motion.div variants={panelSwap} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <div className="flex flex-col items-center gap-6">
        <PhotoUpload onFileSelect={setAvatarFile} loading={loading} profile={profile} />
        <div className="grid grid-cols-1 gap-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} autoComplete="given-name" />
              {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} autoComplete="family-name" />
              {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
            </div>
          </div>
        </div>
      </div>
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Your info is private. You can edit this anytime in your profile settings.
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-end pt-2">
        <Button onClick={handleNext} size="lg" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};
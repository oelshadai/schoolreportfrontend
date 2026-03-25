import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, getRoleDashboardPath } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    school_name: '',
    admin_email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.registerSchool(formData);
      
      // Auto-login after registration
      setAuth(response.user, response.access, response.refresh);
      
      toast.success('School registered successfully!');
      navigate(getRoleDashboardPath(response.user.role));
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(175_42%_46%/0.15),transparent_60%)]" />
        <div className="relative z-10 text-primary-foreground max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/20 backdrop-blur-sm">
              <GraduationCap className="h-10 w-10 text-secondary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            School Report <span className="text-secondary">SaaS</span>
          </h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            Join hundreds of schools using our comprehensive management platform. Get started with a free account today!
          </p>
          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-secondary text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-primary-foreground">Free to Start</p>
                <p className="text-sm text-primary-foreground/60">No credit card required</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-secondary text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-primary-foreground">Quick Setup</p>
                <p className="text-sm text-primary-foreground/60">Get started in minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-secondary text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-primary-foreground">Full Features</p>
                <p className="text-sm text-primary-foreground/60">Access all management tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">School Report SaaS</span>
          </div>

          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
            <h2 className="text-2xl font-bold text-foreground">Register Your School</h2>
            <p className="text-muted-foreground">Create your school account and get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="school_name">School Name *</Label>
              <Input
                id="school_name"
                placeholder="e.g., St. Mary's School"
                value={formData.school_name}
                onChange={(e) => handleChange('school_name', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin_email">Admin Email *</Label>
              <Input
                id="admin_email"
                type="email"
                placeholder="admin@school.edu"
                value={formData.admin_email}
                onChange={(e) => handleChange('admin_email', e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be your login email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirm">Confirm Password *</Label>
              <Input
                id="password_confirm"
                type="password"
                placeholder="••••••••"
                value={formData.password_confirm}
                onChange={(e) => handleChange('password_confirm', e.target.value)}
                required
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create School Account
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../state/AuthContext';
import ReportPreviewModal from '../components/ReportPreviewModal';
import ImageCaptureInput from '../components/ImageCaptureInput';
import { FaSchool, FaCog, FaPalette, FaClipboardList, FaSave, FaEye, FaCalendarAlt } from 'react-icons/fa';

export default function SchoolSettings() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [currentTerm, setCurrentTerm] = useState(null);
  
  // Enhanced responsive design with proper breakpoints
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobile = screenSize.width <= 768;
  const isTablet = screenSize.width <= 1024 && screenSize.width > 768;
  const isSmallMobile = screenSize.width <= 480;
  const [settings, setSettings] = useState({
    name: '',
    address: '',
    location: '',
    phone_number: '',
    email: '',
    website: '',
    motto: '',
    logo: null,
    score_entry_mode: 'CLASS_TEACHER',
    grade_scale_a_min: 80,
    grade_scale_b_min: 70,
    grade_scale_c_min: 60,
    grade_scale_d_min: 50,
    grade_scale_f_min: 0,
    show_position_in_class: true,
    show_student_photos: true,
    show_attendance: true,
    show_behavior_comments: true,
    class_teacher_signature_required: true,
    show_headteacher_signature: true,
    report_template: 'STANDARD',
    current_academic_year: '',
    current_term: '',
    term_closing_date: '',
    term_reopening_date: '',
    show_promotion_on_terminal: true,
    principal_name: ''
  });

  useEffect(() => {
    fetchSettings();
    fetchAcademicData();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/schools/settings/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings({
        ...response.data,
        current_term: response.data.current_term || ''
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({
        text: 'Failed to load school settings',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicData = async () => {
    try {
      const [yearsResponse, termsResponse] = await Promise.all([
        api.get('/schools/academic-years/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/schools/terms/', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      // Ensure data is arrays
      const yearsData = Array.isArray(yearsResponse.data) ? yearsResponse.data : [];
      const termsData = Array.isArray(termsResponse.data) ? termsResponse.data : [];
      
      setAcademicYears(yearsData);
      setTerms(termsData);
      setCurrentTerm(termsData.find(term => term.is_current) || null);
    } catch (error) {
      console.error('Error fetching academic data:', error);
      // Set empty arrays on error
      setAcademicYears([]);
      setTerms([]);
      setCurrentTerm(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;
    
    // Handle URL field - convert empty string to null for backend
    if (name === 'website' && value.trim() === '') {
      processedValue = '';
    }
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
  };

  const handleLogoChange = (logoData) => {
    setLogoFile(logoData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      // Prepare FormData if logo file is being uploaded
      let payload;
      let headers = { Authorization: `Bearer ${token}` };
      
      if (logoFile && logoFile.blob) {
        // Use FormData for file upload
        payload = new FormData();
        
        // Add logo file
        payload.append('logo', logoFile.blob, logoFile.fileName || 'school_logo.jpg');
        
        // Add other settings (exclude logo from settings object)
        Object.entries(settings).forEach(([key, value]) => {
          if (key !== 'logo' && value !== null && value !== undefined) {
            payload.append(key, value);
          }
        });
        
        // Don't set Content-Type header - let browser set it for FormData
      } else {
        // Regular JSON payload - exclude logo field entirely if no new logo
        const cleanedSettings = { ...settings };
        delete cleanedSettings.logo; // Remove logo field completely
        
        // Convert empty website to null
        if (!cleanedSettings.website || cleanedSettings.website.trim() === '') {
          cleanedSettings.website = null;
        }

        // Only send fields the API accepts
        const allowedKeys = [
          'id','name','address','location','phone_number','email','motto','website','current_academic_year','current_term',
          'score_entry_mode','is_active','principal_name','term_closing_date','term_reopening_date','show_promotion_on_terminal',
          'report_template','report_header_text','report_footer_text',
          'show_class_average','show_position_in_class','show_attendance','show_behavior_comments',
          'principal_signature','class_teacher_signature_required','show_student_photos','show_headteacher_signature',
          'grade_scale_a_min','grade_scale_b_min','grade_scale_c_min','grade_scale_d_min','grade_scale_f_min'
        ];
        payload = Object.fromEntries(
          Object.entries(cleanedSettings).filter(([k]) => allowedKeys.includes(k))
        );
        headers['Content-Type'] = 'application/json';
      }

      const response = await api.patch('/schools/settings/', payload, { headers });
      
      // Update settings with response data
      setSettings(response.data);
      setLogoFile(null); // Clear logo file after successful upload
      
      setMessage({
        text: 'School settings updated successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      const data = error?.response?.data;
      let friendly = 'Failed to update settings';
      if (data) {
        if (typeof data === 'string') friendly = data;
        else if (data.detail) friendly = data.detail;
        else {
          const key = Object.keys(data)[0];
          if (key) {
            const val = Array.isArray(data[key]) ? data[key][0] : data[key];
            friendly = `${key}: ${val}`;
          }
        }
      }
      setMessage({ text: friendly, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewTemplate = async () => {
    setLoadingPreview(true);
    try {
      // Use the working template-preview-standalone endpoint directly
      const baseURL = api.defaults.baseURL?.replace(/\/$/, '') || 'http://localhost:8000/api';
      const previewUrl = `${baseURL}/reports/template-preview-standalone/?token=${token}`;
      
      // Open in new window - this works reliably
      window.open(previewUrl, '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
      
      setMessage({
        text: 'Preview opened in new window',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error opening preview:', error);
      setMessage({
        text: 'Failed to open template preview',
        type: 'error'
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: isMobile ? '20px 12px' : '24px 20px',
        paddingTop: isMobile ? '120px' : '120px',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'white',
          borderRadius: 20,
          padding: '40px 30px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #16a34a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>Loading school settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: isSmallMobile ? '16px 8px' : isMobile ? '20px 12px' : isTablet ? '24px 16px' : '32px 20px',
      paddingTop: '160px',
      overflow: 'auto'
    }}>
      <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: isMobile ? 16 : 20,
        padding: isMobile ? '20px 16px' : '24px 20px',
        marginBottom: isMobile ? 20 : 24,
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 12 : 16
      }}>
        <div style={{
          background: '#16a34a',
          borderRadius: 12,
          padding: isMobile ? '12px' : '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.3)'
        }}>
          <FaSchool size={isMobile ? 20 : 24} color="white" />
        </div>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: isMobile ? 22 : isTablet ? 26 : 32,
            fontWeight: 700,
            color: '#1f2937'
          }}>School Settings</h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: isMobile ? 13 : 14,
            color: '#6b7280',
            fontWeight: 500
          }}>
            Manage your school information and preferences
          </p>
        </div>
      </div>
      {/* Main Content */}
      <div style={{
        background: 'white',
        borderRadius: isMobile ? 16 : 20,
        padding: isMobile ? '20px 16px' : '24px 20px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {message.text && (
          <div style={{
            padding: isMobile ? '16px' : '16px 20px',
            marginBottom: '24px',
            background: message.type === 'success' 
              ? '#f0fdf4' 
              : '#fef2f2',
            border: message.type === 'success'
              ? '1px solid #bbf7d0'
              : '1px solid #fecaca',
            borderRadius: 12,
            color: message.type === 'success' ? '#166534' : '#dc2626',
            fontSize: isMobile ? 14 : 15,
            fontWeight: 500,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{message.text}</span>
            <button
              onClick={() => setMessage({ text: '', type: '' })}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                opacity: 0.7
              }}
            >
              ×
            </button>
          </div>
        )}

        
        <form onSubmit={handleSubmit}>
          {/* School Information Section */}
          <div style={{
            background: '#f8fafc',
            borderRadius: 12,
            padding: isMobile ? '16px' : '20px',
            marginBottom: '24px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: isMobile ? 18 : 20,
              fontWeight: 600,
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaSchool size={16} style={{color: '#16a34a'}} />
              School Information & Terms
            </h3>
            
            {/* Logo Upload Section */}
            <div style={{
              marginBottom: '24px',
              padding: isMobile ? '16px' : '20px',
              background: 'white',
              borderRadius: 10,
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{
                margin: '0 0 16px 0',
                fontSize: isMobile ? 16 : 18,
                fontWeight: 600,
                color: '#374151'
              }}>School Logo</h4>
              
              {settings.logo && (
                <div style={{
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <img 
                      src={settings.logo} 
                      alt="Current school logo" 
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid rgba(59, 130, 246, 0.3)'
                      }}
                    />
                    <div>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: 500
                      }}>Current Logo</p>
                      <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#9ca3af'
                      }}>Upload a new logo to replace</p>
                    </div>
                  </div>
                </div>
              )}
              
              <ImageCaptureInput
                label={settings.logo ? "Upload New Logo" : "Upload School Logo"}
                onChange={handleLogoChange}
                maxWidth={400}
                quality={0.9}
                showBothOptions={true}
              />
              <p style={{
                margin: '8px 0 0 0',
                fontSize: '12px',
                color: '#9ca3af',
                lineHeight: 1.4
              }}>
                Recommended: Square image (400x400px or larger) in PNG or JPG format
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>School Name *</label>
                <input
                  type="text"
                  name="name"
                  value={settings.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    fontSize: isMobile ? 16 : 15,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: 'white',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>Academic Year *</label>
                <input
                  type="text"
                  name="current_academic_year"
                  value={settings.current_academic_year}
                  onChange={handleInputChange}
                  placeholder="e.g., 2024-2025"
                  required
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    fontSize: isMobile ? 16 : 15,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: 'white',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            
            {/* Current Term Selection */}
            <div style={{
              marginBottom: '16px'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151'
              }}>Current Term</label>
              <select
                name="current_term"
                value={settings.current_term}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: isMobile ? '14px 16px' : '12px 16px',
                  fontSize: isMobile ? 16 : 15,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  color: '#1f2937',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select current term...</option>
                <option value="1st Term">1st Term</option>
                <option value="2nd Term">2nd Term</option>
                <option value="3rd Term">3rd Term</option>
              </select>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151'
              }}>Address</label>
              <textarea
                name="address"
                value={settings.address}
                onChange={handleInputChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: isMobile ? '14px 16px' : '12px 16px',
                  fontSize: isMobile ? 16 : 15,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  color: '#1f2937',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151'
              }}>Location/City</label>
              <input
                type="text"
                name="location"
                value={settings.location}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: isMobile ? '14px 16px' : '12px 16px',
                  fontSize: isMobile ? 16 : 15,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  color: '#1f2937',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>Phone</label>
                <input
                  type="text"
                  name="phone_number"
                  value={settings.phone_number}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    fontSize: isMobile ? 16 : 15,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: 'white',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    fontSize: isMobile ? 16 : 15,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: 'white',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>Website</label>
                <input
                  type="url"
                  name="website"
                  value={settings.website || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com (optional)"
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    fontSize: isMobile ? 16 : 15,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: 'white',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>School Motto</label>
                <input
                  type="text"
                  name="motto"
                  value={settings.motto}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    fontSize: isMobile ? 16 : 15,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: 'white',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>Principal Name</label>
                <input
                  type="text"
                  name="principal_name"
                  value={settings.principal_name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    fontSize: isMobile ? 16 : 15,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: 'white',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>Term Closing Date</label>
                <input
                  type="date"
                  name="term_closing_date"
                  value={settings.term_closing_date}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    fontSize: isMobile ? 16 : 15,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: 'white',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>Term Reopening Date</label>
                <input
                  type="date"
                  name="term_reopening_date"
                  value={settings.term_reopening_date}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    fontSize: isMobile ? 16 : 15,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: 'white',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Teacher Permissions Section */}
          <div style={{
            background: '#f0fdf4',
            borderRadius: 12,
            padding: isMobile ? '16px' : '20px',
            marginBottom: '24px',
            border: '1px solid #bbf7d0'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: isMobile ? 18 : 20,
              fontWeight: 600,
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaCog size={16} style={{color: '#16a34a'}} />
              Teacher Permissions
            </h3>
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151'
              }}>Score Entry Mode</label>
              <select
                name="score_entry_mode"
                value={settings.score_entry_mode}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: isMobile ? '14px 16px' : '12px 16px',
                  fontSize: isMobile ? 16 : 15,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  color: '#1f2937',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              >
                <option value="CLASS_TEACHER">Class Teacher Only (Class teachers can enter all subject scores for their class)</option>
                <option value="SUBJECT_TEACHER">Subject Teacher (Each teacher enters scores for their assigned subjects)</option>
              </select>
              <p style={{
                margin: '8px 0 0 0',
                fontSize: '12px',
                color: '#9ca3af',
                lineHeight: 1.4
              }}>
                Choose how teachers can enter student scores.
              </p>
            </div>
          </div>

          {/* Grading System Section */}
          <div style={{
            background: '#fefbff',
            borderRadius: 12,
            padding: isMobile ? '16px' : '20px',
            marginBottom: '24px',
            border: '1px solid #e4e4e7'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: isMobile ? 18 : 20,
              fontWeight: 600,
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaClipboardList size={16} style={{color: '#8b5cf6'}} />
              Grading System
            </h3>
            
            <h4 style={{
              margin: '0 0 16px 0',
              fontSize: isMobile ? 16 : 18,
              fontWeight: 600,
              color: '#374151'
            }}>Grade Scale</h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isSmallMobile ? '1fr' : isMobile ? '1fr 1fr' : 'repeat(5, 1fr)',
              gap: isSmallMobile ? '8px' : '12px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>Grade A (min)</label>
                <input
                  type="number"
                  name="grade_scale_a_min"
                  value={settings.grade_scale_a_min}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    fontSize: isMobile ? 16 : 15,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: 'white',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>Grade B (min)</label>
                <input
                  type="number"
                  name="grade_scale_b_min"
                  value={settings.grade_scale_b_min}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    fontSize: isMobile ? 16 : 15,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: 'white',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>Grade C (min)</label>
                <input
                  type="number"
                  name="grade_scale_c_min"
                  value={settings.grade_scale_c_min}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    fontSize: isMobile ? 16 : 15,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: 'white',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>Grade D (min)</label>
                <input
                  type="number"
                  name="grade_scale_d_min"
                  value={settings.grade_scale_d_min}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    fontSize: isMobile ? 16 : 15,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: 'white',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>Grade F (min)</label>
                <input
                  type="number"
                  name="grade_scale_f_min"
                  value={settings.grade_scale_f_min}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    fontSize: isMobile ? 16 : 15,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: 'white',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Report Settings Section */}
          <div style={{
            background: '#fdf2f8',
            borderRadius: 12,
            padding: isMobile ? '16px' : '20px',
            marginBottom: '24px',
            border: '1px solid #fce7f3'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: isMobile ? 18 : 20,
              fontWeight: 600,
              color: '#be185d',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaPalette size={16} style={{color: '#ec4899'}} />
              Report Settings
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151'
              }}>Report Template</label>
              <select
                name="report_template"
                value={settings.report_template}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: isMobile ? '14px 16px' : '12px 16px',
                  fontSize: isMobile ? 16 : 15,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  color: '#1f2937',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              >
                <option value="STANDARD">Standard Template</option>
                <option value="GHANA_EDUCATION_SERVICE">Ghana Education Service Template</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <button
                type="button"
                onClick={handlePreviewTemplate}
                disabled={loadingPreview}
                style={{
                  padding: isMobile ? '12px 20px' : '10px 18px',
                  fontSize: isMobile ? 15 : 14,
                  fontWeight: 600,
                  border: '1px solid #3b82f6',
                  borderRadius: 8,
                  background: loadingPreview ? '#f3f4f6' : '#eff6ff',
                  color: loadingPreview ? '#6b7280' : '#1d4ed8',
                  cursor: loadingPreview ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: loadingPreview ? 0.6 : 1
                }}
              >
                {loadingPreview ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(59, 130, 246, 0.3)',
                      borderTop: '2px solid #3b82f6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Loading Preview...
                  </>
                ) : (
                  <>
                    <FaEye size={16} />
                    Preview Report Template
                  </>
                )}
              </button>
              <p style={{
                margin: '8px 0 0 0',
                fontSize: '12px',
                color: '#9ca3af',
                lineHeight: 1.4
              }}>
                Click to see how your reports will look with current settings
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isSmallMobile ? '1fr' : isMobile ? '1fr 1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)',
              gap: isSmallMobile ? '12px' : '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div 
                  onClick={() => handleInputChange({target: {name: 'show_position_in_class', type: 'checkbox', checked: !settings.show_position_in_class}})}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: settings.show_position_in_class ? '#3b82f6' : '#64748b',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '1px',
                    left: settings.show_position_in_class ? '23px' : '3px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <label 
                  onClick={() => handleInputChange({target: {name: 'show_position_in_class', type: 'checkbox', checked: !settings.show_position_in_class}})}
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  Show Positions
                </label>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div 
                  onClick={() => handleInputChange({target: {name: 'show_student_photos', type: 'checkbox', checked: !settings.show_student_photos}})}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: settings.show_student_photos ? '#3b82f6' : '#64748b',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '1px',
                    left: settings.show_student_photos ? '23px' : '3px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <label 
                  onClick={() => handleInputChange({target: {name: 'show_student_photos', type: 'checkbox', checked: !settings.show_student_photos}})}
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  Show Student Photos
                </label>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div 
                  onClick={() => handleInputChange({target: {name: 'show_attendance', type: 'checkbox', checked: !settings.show_attendance}})}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: settings.show_attendance ? '#3b82f6' : '#64748b',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '1px',
                    left: settings.show_attendance ? '23px' : '3px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <label 
                  onClick={() => handleInputChange({target: {name: 'show_attendance', type: 'checkbox', checked: !settings.show_attendance}})}
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  Show Attendance
                </label>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isSmallMobile ? '1fr' : isMobile ? '1fr 1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)',
              gap: isSmallMobile ? '12px' : '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div 
                  onClick={() => handleInputChange({target: {name: 'show_behavior_comments', type: 'checkbox', checked: !settings.show_behavior_comments}})}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: settings.show_behavior_comments ? '#3b82f6' : '#64748b',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '1px',
                    left: settings.show_behavior_comments ? '23px' : '3px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <label 
                  onClick={() => handleInputChange({target: {name: 'show_behavior_comments', type: 'checkbox', checked: !settings.show_behavior_comments}})}
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  Show Behavior Comments
                </label>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div 
                  onClick={() => handleInputChange({target: {name: 'class_teacher_signature_required', type: 'checkbox', checked: !settings.class_teacher_signature_required}})}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: settings.class_teacher_signature_required ? '#3b82f6' : '#64748b',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '1px',
                    left: settings.class_teacher_signature_required ? '23px' : '3px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <label 
                  onClick={() => handleInputChange({target: {name: 'class_teacher_signature_required', type: 'checkbox', checked: !settings.class_teacher_signature_required}})}
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  Class Teacher Signature
                </label>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div 
                  onClick={() => handleInputChange({target: {name: 'show_headteacher_signature', type: 'checkbox', checked: !settings.show_headteacher_signature}})}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: settings.show_headteacher_signature ? '#3b82f6' : '#64748b',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '1px',
                    left: settings.show_headteacher_signature ? '23px' : '3px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <label 
                  onClick={() => handleInputChange({target: {name: 'show_headteacher_signature', type: 'checkbox', checked: !settings.show_headteacher_signature}})}
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  Head Teacher Signature
                </label>
              </div>
            </div>
            
            {/* Terminal Report Settings */}
            <div style={{
              marginTop: '24px',
              padding: isMobile ? '16px' : '20px',
              background: 'white',
              borderRadius: 10,
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{
                margin: '0 0 16px 0',
                fontSize: isMobile ? 16 : 18,
                fontWeight: 600,
                color: '#374151'
              }}>Terminal Report Settings</h4>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div 
                  onClick={() => handleInputChange({target: {name: 'show_promotion_on_terminal', type: 'checkbox', checked: !settings.show_promotion_on_terminal}})}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: settings.show_promotion_on_terminal ? '#3b82f6' : '#64748b',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '1px',
                    left: settings.show_promotion_on_terminal ? '23px' : '3px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <label 
                  onClick={() => handleInputChange({target: {name: 'show_promotion_on_terminal', type: 'checkbox', checked: !settings.show_promotion_on_terminal}})}
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  Show Promotion Status on Terminal Reports
                </label>
              </div>
              
              <p style={{
                margin: '0',
                fontSize: '12px',
                color: '#9ca3af',
                lineHeight: 1.4
              }}>
                When enabled, terminal reports will display promotion status and term dates set above.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div style={{
            padding: isMobile ? '20px 0' : '24px 0',
            borderTop: '1px solid #e5e7eb',
            marginTop: '24px'
          }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                padding: isMobile ? '16px 24px' : '14px 24px',
                fontSize: isMobile ? 16 : 15,
                fontWeight: 700,
                border: 'none',
                borderRadius: 12,
                background: saving 
                  ? '#9ca3af'
                  : '#16a34a',
                color: 'white',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: saving ? 'none' : '0 4px 6px -1px rgba(22, 163, 74, 0.3)',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave size={16} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Report Preview Modal */}
      <ReportPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        previewData={previewData}
      />

      {/* CSS Animations and Mobile Styles */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Enhanced Mobile Responsive Styles */
        @media (max-width: 480px) {
          .settings-grid-single { grid-template-columns: 1fr !important; }
          .settings-grid-double { grid-template-columns: 1fr !important; }
          .settings-grid-triple { grid-template-columns: 1fr 1fr !important; }
          .settings-grid-grades { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .settings-grid-toggles { grid-template-columns: 1fr !important; gap: 12px !important; }
          .toggle-label-mobile { font-size: 12px !important; line-height: 1.2 !important; }
        }
        
        @media (min-width: 481px) and (max-width: 768px) {
          .settings-grid-double { grid-template-columns: 1fr !important; }
          .settings-grid-triple { grid-template-columns: 1fr 1fr !important; }
          .settings-grid-grades { grid-template-columns: repeat(3, 1fr) !important; }
          .settings-grid-toggles { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
      </div>
    </div>
  );
}
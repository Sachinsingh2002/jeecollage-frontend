import React, { useEffect, useState, useRef } from 'react';
import { Header } from '../components/Header';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { FloppyDisk, Plus, Trash, PencilSimple, Eye, UploadSimple, Sun, Moon, Image, ArrowUp, ArrowDown } from '@phosphor-icons/react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TABS = [
  { key: 'hero', label: 'Hero Section' },
  { key: 'branding', label: 'Branding & Theme' },
  { key: 'pages', label: 'Page Editors' },
  { key: 'seo', label: 'SEO Settings' },
  { key: 'footer', label: 'Footer' },
  { key: 'quick_actions', label: 'Quick Actions' },
  { key: 'community_categories', label: 'Community' },
  { key: 'colleges', label: 'Manage Colleges' },
];

export const AdminCMS = () => {
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const { refreshTheme } = useTheme();

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get(`${API}/site-settings`);
      setSettings(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await axios.put(`${API}/site-settings`, settings, { withCredentials: true });
      setSaved(true);
      refreshTheme();
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Failed to save: ' + (e.response?.data?.detail || e.message));
    }
    finally { setSaving(false); }
  };

  const updateField = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const updateStat = (index, field, value) => {
    setSettings(prev => {
      const stats = [...prev.hero.stats];
      stats[index] = { ...stats[index], [field]: value };
      return { ...prev, hero: { ...prev.hero, stats } };
    });
  };

  const updateFooterLink = (index, field, value) => {
    setSettings(prev => {
      const links = [...prev.footer.links];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, footer: { ...prev.footer, links } };
    });
  };

  const addFooterLink = () => {
    setSettings(prev => ({
      ...prev,
      footer: { ...prev.footer, links: [...prev.footer.links, { label: "New Link", url: "/" }] }
    }));
  };

  const removeFooterLink = (index) => {
    setSettings(prev => ({
      ...prev,
      footer: { ...prev.footer, links: prev.footer.links.filter((_, i) => i !== index) }
    }));
  };

  const updateQuickAction = (index, field, value) => {
    setSettings(prev => {
      const qa = [...prev.quick_actions];
      qa[index] = { ...qa[index], [field]: value };
      return { ...prev, quick_actions: qa };
    });
  };

  const updateCategory = (index, field, value) => {
    setSettings(prev => {
      const cats = [...prev.community_categories];
      cats[index] = { ...cats[index], [field]: value };
      return { ...prev, community_categories: cats };
    });
  };

  const updatePage = (page, field, value) => {
    setSettings(prev => ({
      ...prev,
      pages: { ...prev.pages, [page]: { ...prev.pages?.[page], [field]: value } }
    }));
  };

  const moveItem = (section, index, direction) => {
    setSettings(prev => {
      const arr = [...prev[section]];
      const newIdx = index + direction;
      if (newIdx < 0 || newIdx >= arr.length) return prev;
      [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]];
      return { ...prev, [section]: arr };
    });
  };

  const moveFooterLink = (index, direction) => {
    setSettings(prev => {
      const links = [...prev.footer.links];
      const newIdx = index + direction;
      if (newIdx < 0 || newIdx >= links.length) return prev;
      [links[index], links[newIdx]] = [links[newIdx], links[index]];
      return { ...prev, footer: { ...prev.footer, links } };
    });
  };

  const [uploading, setUploading] = useState(false);

  const uploadImage = async (onSuccess) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      try {
        const form = new FormData();
        form.append('file', file);
        const { data } = await axios.post(`${API}/upload`, form, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const imageUrl = `${BACKEND_URL}${data.url}`;
        onSuccess(imageUrl);
      } catch (err) {
        alert('Upload failed: ' + (err.response?.data?.detail || err.message));
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const ImageUploadField = ({ label, value, onChange }) => (
    <div className="mb-4">
      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2 text-zinc-600">{label}</label>
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL or upload"
            className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7] text-sm" />
        </div>
        <button onClick={() => uploadImage(onChange)} disabled={uploading}
          className="px-4 py-3 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 transition-colors flex items-center gap-2 text-sm font-bold disabled:opacity-50">
          <UploadSimple size={16} weight="bold" />
          {uploading ? '...' : 'Upload'}
        </button>
      </div>
      {value && (
        <div className="mt-2 border border-zinc-200 p-2 inline-block">
          <img src={value} alt="Preview" className="h-20 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      )}
    </div>
  );

  const InputField = ({ label, value, onChange, type = 'text', rows }) => (
    <div className="mb-4">
      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2 text-zinc-600">{label}</label>
      {rows ? (
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={rows}
          className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7] text-sm" />
      ) : (
        <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7] text-sm" />
      )}
    </div>
  );

  if (loading || !settings) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white">
          <Header />
          <div className="px-6 md:px-12 lg:px-24 py-12 text-center">Loading settings...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50">
        <Header />
        <div className="px-6 md:px-12 lg:px-24 py-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" data-testid="cms-heading">Site Editor</h1>
              <p className="text-sm text-zinc-500 mt-1">Edit your website content, branding, and settings</p>
            </div>
            <div className="flex items-center gap-3">
              {saved && <span className="text-green-600 text-sm font-bold" data-testid="save-success">Saved!</span>}
              <a href="/" target="_blank" rel="noopener noreferrer">
                <button className="px-4 py-2 border border-zinc-300 text-sm font-bold hover:bg-zinc-100 transition-colors flex items-center gap-2" data-testid="preview-button">
                  <Eye size={16} weight="bold" /> Preview
                </button>
              </a>
              <button onClick={saveSettings} disabled={saving} data-testid="save-settings-button"
                className="px-6 py-2 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50">
                <FloppyDisk size={16} weight="bold" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Tabs */}
            <aside className="w-56 flex-shrink-0">
              <div className="bg-white border border-zinc-200 p-2">
                {TABS.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} data-testid={`cms-tab-${tab.key}`}
                    className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors mb-1 ${
                      activeTab === tab.key ? 'bg-[#002FA7] text-white' : 'hover:bg-zinc-100 text-zinc-700'
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1">
              <div className="bg-white border border-zinc-200 p-8">

                {/* HERO SECTION */}
                {activeTab === 'hero' && (
                  <div data-testid="cms-hero-editor">
                    <h2 className="text-xl font-bold mb-6">Hero Section</h2>
                    <InputField label="Badge Text" value={settings.hero.badge} onChange={(v) => updateField('hero', 'badge', v)} />
                    <div className="grid grid-cols-3 gap-4">
                      <InputField label="Heading Prefix" value={settings.hero.heading_prefix} onChange={(v) => updateField('hero', 'heading_prefix', v)} />
                      <InputField label="Heading Highlight (colored)" value={settings.hero.heading_highlight} onChange={(v) => updateField('hero', 'heading_highlight', v)} />
                      <InputField label="Heading Suffix" value={settings.hero.heading_suffix} onChange={(v) => updateField('hero', 'heading_suffix', v)} />
                    </div>
                    <InputField label="Subheading" value={settings.hero.subheading} onChange={(v) => updateField('hero', 'subheading', v)} rows={2} />
                    <InputField label="Description" value={settings.hero.description} onChange={(v) => updateField('hero', 'description', v)} rows={2} />

                    <ImageUploadField label="Hero Background Image (optional)" value={settings.hero?.background_image} onChange={(v) => updateField('hero', 'background_image', v)} />

                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] mt-6 mb-3 text-zinc-500">Call-to-Action Buttons</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Primary CTA Text" value={settings.hero.cta_primary_text} onChange={(v) => updateField('hero', 'cta_primary_text', v)} />
                      <InputField label="Primary CTA Link" value={settings.hero.cta_primary_link} onChange={(v) => updateField('hero', 'cta_primary_link', v)} />
                      <InputField label="Secondary CTA Text" value={settings.hero.cta_secondary_text} onChange={(v) => updateField('hero', 'cta_secondary_text', v)} />
                      <InputField label="Secondary CTA Link" value={settings.hero.cta_secondary_link} onChange={(v) => updateField('hero', 'cta_secondary_link', v)} />
                      <InputField label="Tertiary CTA Text" value={settings.hero.cta_tertiary_text} onChange={(v) => updateField('hero', 'cta_tertiary_text', v)} />
                      <InputField label="Tertiary CTA Link" value={settings.hero.cta_tertiary_link} onChange={(v) => updateField('hero', 'cta_tertiary_link', v)} />
                    </div>

                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] mt-6 mb-3 text-zinc-500">Stats Row</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {settings.hero.stats.map((stat, idx) => (
                        <div key={idx} className="flex gap-2">
                          <div className="flex-1">
                            <InputField label={`Stat ${idx + 1} Value`} value={stat.value} onChange={(v) => updateStat(idx, 'value', v)} />
                          </div>
                          <div className="flex-1">
                            <InputField label={`Stat ${idx + 1} Label`} value={stat.label} onChange={(v) => updateStat(idx, 'label', v)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* BRANDING */}
                {activeTab === 'branding' && (
                  <div data-testid="cms-branding-editor">
                    <h2 className="text-xl font-bold mb-6">Branding & Theme</h2>

                    {/* Theme Switcher */}
                    <div className="mb-6 p-6 bg-zinc-50 border border-zinc-200">
                      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-3 text-zinc-600">Theme Mode</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => updateField('branding', 'theme', 'light')}
                          data-testid="theme-light-btn"
                          className={`flex-1 p-4 border-2 flex items-center justify-center gap-3 font-bold transition-colors ${
                            settings.branding.theme === 'light' ? 'border-[#002FA7] bg-white text-[#002FA7]' : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400'
                          }`}
                        >
                          <Sun size={24} weight="bold" />
                          Light Mode
                        </button>
                        <button
                          onClick={() => updateField('branding', 'theme', 'dark')}
                          data-testid="theme-dark-btn"
                          className={`flex-1 p-4 border-2 flex items-center justify-center gap-3 font-bold transition-colors ${
                            settings.branding.theme === 'dark' ? 'border-[#002FA7] bg-[#09090B] text-[#002FA7]' : 'border-zinc-200 bg-[#09090B] text-zinc-400 hover:border-zinc-500'
                          }`}
                        >
                          <Moon size={24} weight="bold" />
                          Dark Mode
                        </button>
                      </div>
                    </div>

                    <ImageUploadField label="Logo Image (optional, overrides text logo)" value={settings.branding?.logo_image} onChange={(v) => updateField('branding', 'logo_image', v)} />

                    <div className="grid grid-cols-3 gap-4">
                      <InputField label='Logo Part 1 (e.g. "JEE")' value={settings.branding.logo_part1} onChange={(v) => updateField('branding', 'logo_part1', v)} />
                      <InputField label='Logo Part 2 (colored, e.g. "college")' value={settings.branding.logo_part2} onChange={(v) => updateField('branding', 'logo_part2', v)} />
                      <InputField label='Logo Part 3 (e.g. ".com")' value={settings.branding.logo_part3} onChange={(v) => updateField('branding', 'logo_part3', v)} />
                    </div>
                    <InputField label="Site Name" value={settings.branding.site_name} onChange={(v) => updateField('branding', 'site_name', v)} />
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2 text-zinc-600">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={settings.branding.primary_color} onChange={(e) => updateField('branding', 'primary_color', e.target.value)}
                          className="w-12 h-12 border border-zinc-200 cursor-pointer" />
                        <input type="text" value={settings.branding.primary_color} onChange={(e) => updateField('branding', 'primary_color', e.target.value)}
                          className="bg-white border border-zinc-200 px-4 py-3 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                      </div>
                    </div>
                    <div className="mt-6 p-4 border border-zinc-200" style={{ backgroundColor: settings.branding.theme === 'dark' ? '#09090B' : '#FAFAFA' }}>
                      <p className="text-xs mb-2" style={{ color: settings.branding.theme === 'dark' ? '#71717A' : '#71717A' }}>Preview:</p>
                      {settings.branding.logo_image ? (
                        <img src={settings.branding.logo_image} alt="Logo" className="h-10 w-auto" />
                      ) : (
                        <div className="text-3xl font-black tracking-tighter" style={{ color: settings.branding.theme === 'dark' ? '#FFFFFF' : '#09090B' }}>
                          {settings.branding.logo_part1}<span style={{ color: settings.branding.primary_color }}>{settings.branding.logo_part2}</span><span style={{ color: settings.branding.theme === 'dark' ? '#52525B' : '#A1A1AA' }} className="text-xl">{settings.branding.logo_part3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PAGE EDITORS */}
                {activeTab === 'pages' && (
                  <div data-testid="cms-pages-editor">
                    <h2 className="text-xl font-bold mb-6">Page-Specific Content</h2>
                    
                    <div className="bg-zinc-50 border border-zinc-200 p-6 mb-6">
                      <h3 className="text-base font-bold mb-4 flex items-center gap-2"><Image size={20} weight="bold" className="text-[#002FA7]" /> Colleges Page</h3>
                      <InputField label="Page Heading" value={settings.pages?.colleges?.heading} onChange={(v) => updatePage('colleges', 'heading', v)} />
                      <InputField label="Intro Text" value={settings.pages?.colleges?.intro_text} onChange={(v) => updatePage('colleges', 'intro_text', v)} rows={3} />
                      <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" checked={settings.pages?.colleges?.show_intro || false} onChange={(e) => updatePage('colleges', 'show_intro', e.target.checked)}
                          className="w-4 h-4 accent-[#002FA7]" data-testid="colleges-show-intro" />
                        <span className="text-sm text-zinc-600">Show intro text on Colleges page</span>
                      </div>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 p-6 mb-6">
                      <h3 className="text-base font-bold mb-4 flex items-center gap-2"><Image size={20} weight="bold" className="text-[#002FA7]" /> Community Page</h3>
                      <InputField label="Page Heading" value={settings.pages?.community?.heading} onChange={(v) => updatePage('community', 'heading', v)} />
                      <InputField label="Description" value={settings.pages?.community?.description} onChange={(v) => updatePage('community', 'description', v)} rows={3} />
                      <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" checked={settings.pages?.community?.show_description || false} onChange={(e) => updatePage('community', 'show_description', e.target.checked)}
                          className="w-4 h-4 accent-[#002FA7]" data-testid="community-show-desc" />
                        <span className="text-sm text-zinc-600">Show description on Community page</span>
                      </div>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 p-6 mb-6">
                      <h3 className="text-base font-bold mb-4 flex items-center gap-2"><Image size={20} weight="bold" className="text-[#002FA7]" /> JEE Predictor Page</h3>
                      <InputField label="Page Heading" value={settings.pages?.predictor?.heading} onChange={(v) => updatePage('predictor', 'heading', v)} />
                      <InputField label="Description" value={settings.pages?.predictor?.description} onChange={(v) => updatePage('predictor', 'description', v)} rows={3} />
                      <InputField label="Disclaimer Text" value={settings.pages?.predictor?.disclaimer} onChange={(v) => updatePage('predictor', 'disclaimer', v)} rows={2} />
                    </div>
                  </div>
                )}

                {/* SEO */}
                {activeTab === 'seo' && (
                  <div data-testid="cms-seo-editor">
                    <h2 className="text-xl font-bold mb-6">SEO Settings</h2>
                    <InputField label="Default Page Title" value={settings.seo.default_title} onChange={(v) => updateField('seo', 'default_title', v)} />
                    <InputField label="Default Meta Description" value={settings.seo.default_description} onChange={(v) => updateField('seo', 'default_description', v)} rows={3} />
                    <InputField label="Default Keywords (comma separated)" value={settings.seo.default_keywords} onChange={(v) => updateField('seo', 'default_keywords', v)} rows={2} />
                  </div>
                )}

                {/* FOOTER */}
                {activeTab === 'footer' && (
                  <div data-testid="cms-footer-editor">
                    <h2 className="text-xl font-bold mb-6">Footer</h2>
                    <InputField label="Description" value={settings.footer.description} onChange={(v) => updateField('footer', 'description', v)} rows={3} />
                    <InputField label="Copyright Text" value={settings.footer.copyright} onChange={(v) => updateField('footer', 'copyright', v)} />

                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] mt-6 mb-3 text-zinc-500">Footer Links (drag to reorder)</h3>
                    {settings.footer.links.map((link, idx) => (
                      <div key={idx} className="flex gap-2 items-end mb-3">
                        <div className="flex flex-col gap-1 mb-4">
                          <button onClick={() => moveFooterLink(idx, -1)} disabled={idx === 0}
                            className="p-1 border border-zinc-200 hover:bg-zinc-100 disabled:opacity-20" data-testid={`footer-link-up-${idx}`}>
                            <ArrowUp size={12} weight="bold" />
                          </button>
                          <button onClick={() => moveFooterLink(idx, 1)} disabled={idx === settings.footer.links.length - 1}
                            className="p-1 border border-zinc-200 hover:bg-zinc-100 disabled:opacity-20" data-testid={`footer-link-down-${idx}`}>
                            <ArrowDown size={12} weight="bold" />
                          </button>
                        </div>
                        <div className="flex-1">
                          <InputField label={`Link ${idx + 1} Label`} value={link.label} onChange={(v) => updateFooterLink(idx, 'label', v)} />
                        </div>
                        <div className="flex-1">
                          <InputField label={`Link ${idx + 1} URL`} value={link.url} onChange={(v) => updateFooterLink(idx, 'url', v)} />
                        </div>
                        <button onClick={() => removeFooterLink(idx)} className="mb-4 p-3 text-red-500 hover:bg-red-50 border border-red-200">
                          <Trash size={16} weight="bold" />
                        </button>
                      </div>
                    ))}
                    <button onClick={addFooterLink} className="px-4 py-2 border border-zinc-300 text-sm font-bold hover:bg-zinc-100 flex items-center gap-2">
                      <Plus size={14} weight="bold" /> Add Link
                    </button>
                  </div>
                )}

                {/* QUICK ACTIONS */}
                {activeTab === 'quick_actions' && (
                  <div data-testid="cms-quick-actions-editor">
                    <h2 className="text-xl font-bold mb-6">Quick Action Cards (Homepage)</h2>
                    {settings.quick_actions.map((qa, idx) => (
                      <div key={idx} className="bg-zinc-50 border border-zinc-200 p-6 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold">Card {idx + 1}</h3>
                          <div className="flex gap-1">
                            <button onClick={() => moveItem('quick_actions', idx, -1)} disabled={idx === 0}
                              className="p-1 border border-zinc-200 hover:bg-zinc-200 disabled:opacity-20" data-testid={`qa-up-${idx}`}>
                              <ArrowUp size={14} weight="bold" />
                            </button>
                            <button onClick={() => moveItem('quick_actions', idx, 1)} disabled={idx === settings.quick_actions.length - 1}
                              className="p-1 border border-zinc-200 hover:bg-zinc-200 disabled:opacity-20" data-testid={`qa-down-${idx}`}>
                              <ArrowDown size={14} weight="bold" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField label="Title" value={qa.title} onChange={(v) => updateQuickAction(idx, 'title', v)} />
                          <InputField label="Link" value={qa.link} onChange={(v) => updateQuickAction(idx, 'link', v)} />
                        </div>
                        <InputField label="Description" value={qa.description} onChange={(v) => updateQuickAction(idx, 'description', v)} />
                      </div>
                    ))}
                  </div>
                )}

                {/* COMMUNITY CATEGORIES */}
                {activeTab === 'community_categories' && (
                  <div data-testid="cms-community-editor">
                    <h2 className="text-xl font-bold mb-6">Community Categories</h2>
                    {settings.community_categories.map((cat, idx) => (
                      <div key={idx} className="flex gap-4 items-end mb-3">
                        <div className="flex-1">
                          <InputField label={`Category ${idx + 1}`} value={cat.name} onChange={(v) => updateCategory(idx, 'name', v)} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* MANAGE COLLEGES */}
                {activeTab === 'colleges' && (
                  <div data-testid="cms-colleges-editor">
                    <h2 className="text-xl font-bold mb-6">Manage Colleges</h2>
                    <p className="text-sm text-zinc-500 mb-4">Use the dedicated <a href="/admin" className="text-[#002FA7] font-bold hover:underline">Admin Dashboard</a> to add, edit, or manage individual colleges.</p>
                  </div>
                )}

              </div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

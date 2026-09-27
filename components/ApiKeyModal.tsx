import React, { useState, useEffect } from 'react';
import { Key, X, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: { apiKey: string; model: string; baseUrl: string }) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [baseUrl, setBaseUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('rc_user_api_key') || '';
      const storedModel = localStorage.getItem('rc_user_model') || 'gemini-1.5-flash';
      const storedBaseUrl = localStorage.getItem('rc_user_base_url') || '';
      setApiKey(storedKey);
      setModel(storedModel);
      setBaseUrl(storedBaseUrl);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('rc_user_api_key', apiKey.trim());
      localStorage.setItem('rc_user_model', model.trim());
      localStorage.setItem('rc_user_base_url', baseUrl.trim());
    }
    onSave({ apiKey: apiKey.trim(), model: model.trim(), baseUrl: baseUrl.trim() });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rc_user_api_key');
      localStorage.removeItem('rc_user_model');
      localStorage.removeItem('rc_user_base_url');
    }
    setApiKey('');
    setModel('gemini-1.5-flash');
    setBaseUrl('');
    onSave({ apiKey: '', model: 'gemini-1.5-flash', baseUrl: '' });
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog-custom p-4">
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2 border-purple-100">
          <div className="d-flex align-items-center gap-2">
            <div className="brand-icon-box" style={{ width: '34px', height: '34px' }}>
              <Key size={16} />
            </div>
            <h5 className="mb-0 fw-bold" style={{ color: '#2e1065' }}>Pengaturan AI Model</h5>
          </div>
          <button onClick={onClose} className="btn-close-custom">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="mb-3">
            <div className="p-2.5 rounded-3 small d-flex align-items-start gap-2 mb-3" style={{ background: '#f5f3ff', border: '1px solid #e9d5ff', color: '#5b21b6' }}>
              <ShieldCheck size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <span>
                Opsional. Tanpa API key, sistem menggunakan <strong>Evaluator Cerdas Terintegrasi</strong>. Jika Anda memasukkan Google Gemini / OpenAI API key, kunci hanya disimpan di browser lokal Anda.
              </span>
            </div>

            <label className="form-label small fw-semibold" style={{ color: '#2e1065' }}>
              API Key (Google Gemini / OpenAI / Groq)
            </label>
            <input
              type="password"
              className="form-control modal-input"
              placeholder="AIzaSy... atau sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold" style={{ color: '#2e1065' }}>Model AI</label>
            <select
              className="form-select modal-input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
              <option value="gemini-2.0-flash-exp">Google Gemini 2.0 Flash</option>
              <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
              <option value="gpt-4o">OpenAI GPT-4o</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold" style={{ color: '#2e1065' }}>
              Base URL (Opsional)
            </label>
            <input
              type="text"
              className="form-control modal-input"
              placeholder="https://api.openai.com/v1"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>

          <div className="d-flex align-items-center justify-content-between pt-2 border-top border-purple-100">
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-outline-secondary btn-sm"
            >
              Reset
            </button>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-light btn-sm border border-purple-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-send-purple btn-sm"
              >
                {savedSuccess ? (
                  <>
                    <Check size={14} /> Tersimpan!
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Simpan
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

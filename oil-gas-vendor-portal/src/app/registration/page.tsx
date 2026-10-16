'use client';
import { useState } from 'react';

const SERVICE_CATEGORIES = ['Drilling Services', 'Pipeline Services', 'Inspection & NDT', 'Maintenance & Repair', 'Environmental Services', 'Instrumentation & Controls', 'AI/IT Services', 'Engineering Services', 'Safety Services', 'Supply & Materials'];
const CERT_DOCS = ['Liability Insurance (min $5M CAD)', 'WSIB Clearance Letter', 'COR/SECOR Certificate', 'ISO 9001', 'ISO 14001', 'ISO 45001', 'Safety Statistics (TRIF/LTI)'];

const STEPS = ['Company Info', 'Capabilities & Services', 'Safety Certifications', 'Financial Info', 'Review & Submit'];

export default function RegistrationPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    legal_name: '', business_number: '', address: '', phone: '', website: '', years: '',
    categories: [] as string[], trif: '', lti: '',
    hst_number: '', payment_terms: 'Net 30', references: '',
    accepted_terms: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat) ? prev.categories.filter((c) => c !== cat) : [...prev.categories, cat],
    }));
  };

  const handleSubmit = async () => {
    await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: form.legal_name,
        business_number: form.business_number,
        hst_number: form.hst_number,
        service_categories: form.categories,
        safety_trif: parseFloat(form.trif) || 0,
      }),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-white">Application Submitted!</h2>
        <p className="text-gray-400">Your vendor application has been received. Status: <span className="text-yellow-400">Under Review</span></p>
        <p className="text-gray-500 text-sm">Our procurement team will review your application within 5-7 business days.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Vendor Registration</h1>
        <p className="text-gray-400 text-sm mt-1">Complete all 5 steps to become an approved vendor</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < step ? 'bg-green-600 text-white' : i === step ? 'bg-purple-600 text-white' : 'bg-[#1e2a45] text-gray-400'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs hidden md:block ${i === step ? 'text-white' : 'text-gray-500'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`h-px w-4 ${i < step ? 'bg-green-600' : 'bg-[#1e2a45]'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-white font-semibold">Step 1 — Company Information</h2>
            {[['Legal Company Name', 'legal_name'], ['Business Number (CRA)', 'business_number'], ['Primary Address', 'address'], ['Phone Number', 'phone'], ['Website', 'website'], ['Years in Business', 'years']].map(([label, key]) => (
              <div key={key}>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">{label}</label>
                <input type="text" value={(form as Record<string, unknown>)[key] as string} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none" />
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-white font-semibold">Step 2 — Capabilities & Services</h2>
            <p className="text-gray-400 text-sm">Select all service categories applicable to your company:</p>
            <div className="grid grid-cols-2 gap-3">
              {SERVICE_CATEGORIES.map((cat) => (
                <label key={cat} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${form.categories.includes(cat) ? 'border-purple-500 bg-purple-900/20 text-purple-300' : 'border-[#1e2a45] text-gray-300 hover:border-[#2a3a55]'}`}>
                  <input type="checkbox" checked={form.categories.includes(cat)} onChange={() => toggleCategory(cat)} className="accent-purple-500" />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-white font-semibold">Step 3 — Safety Certifications</h2>
            <p className="text-gray-400 text-sm">Upload required safety documents (simulated — file upload UI):</p>
            <div className="space-y-3">
              {CERT_DOCS.map((doc) => (
                <div key={doc} className="flex items-center justify-between p-3 bg-[#1e2a45] rounded-lg">
                  <span className="text-sm text-gray-300">{doc}</span>
                  <button className="text-xs bg-purple-900/50 border border-purple-500 text-purple-300 px-3 py-1 rounded hover:bg-purple-900">Upload</button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">TRIF (Total Recordable Injury Frequency)</label>
                <input type="number" step="0.1" value={form.trif} onChange={(e) => setForm((p) => ({ ...p, trif: e.target.value }))}
                  className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none" placeholder="e.g. 0.8" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">LTI Rate (Lost Time Injury)</label>
                <input type="number" step="0.1" value={form.lti} onChange={(e) => setForm((p) => ({ ...p, lti: e.target.value }))}
                  className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none" placeholder="e.g. 0.2" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-white font-semibold">Step 4 — Financial Information</h2>
            {[['HST/GST Registration Number', 'hst_number'], ['Business References', 'references']].map(([label, key]) => (
              <div key={key}>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">{label}</label>
                <input type="text" value={(form as Record<string, unknown>)[key] as string} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none" />
              </div>
            ))}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Payment Terms Preference</label>
              <select value={form.payment_terms} onChange={(e) => setForm((p) => ({ ...p, payment_terms: e.target.value }))}
                className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none">
                <option>Net 30</option><option>Net 45</option><option>Net 60</option>
              </select>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 text-xs text-yellow-300">
              ⚠️ Banking information is encrypted and stored securely. It will only be used for payment processing.
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-white font-semibold">Step 5 — Review & Submit</h2>
            <div className="space-y-3">
              {[['Company', form.legal_name], ['Business Number', form.business_number], ['HST Number', form.hst_number], ['Services', form.categories.join(', ') || 'None selected'], ['TRIF', form.trif || '—'], ['Payment Terms', form.payment_terms]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-[#1e2a45]">
                  <span className="text-gray-400 text-sm">{k}</span>
                  <span className="text-white text-sm">{v}</span>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.accepted_terms} onChange={(e) => setForm((p) => ({ ...p, accepted_terms: e.target.checked }))} className="accent-purple-500" />
              <span className="text-gray-300 text-sm">I accept the Vendor Terms & Conditions and confirm all information is accurate</span>
            </label>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="border border-[#1e2a45] text-gray-300 px-5 py-2 rounded-lg text-sm hover:border-purple-500">
              ← Back
            </button>
          )}
          {step < 4 ? (
            <button onClick={() => setStep((s) => s + 1)} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!form.accepted_terms} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

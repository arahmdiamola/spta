"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Settings as SettingsIcon } from "lucide-react";
import Base64ImageUpload from "@/components/Base64ImageUpload";
import ResetDatabaseButton from "@/components/ResetDatabaseButton";
import ArchiveDatabaseButton from "@/components/ArchiveDatabaseButton";
import ClearArchivesButton from "@/components/ClearArchivesButton";

export default function SettingsPage() {
  const [feeCategories, setFeeCategories] = useState<any[]>([]);
  const [newFeeName, setNewFeeName] = useState("");
  const [newFeeAmount, setNewFeeAmount] = useState("");
  const [newFeeType, setNewFeeType] = useState("PER_STUDENT");
  const [isAddingFee, setIsAddingFee] = useState(false);
  const [meetingPenalty, setMeetingPenalty] = useState("100");
  const [assemblyPenalty, setAssemblyPenalty] = useState("100");
  const [voluntaryWorkPenalty, setVoluntaryWorkPenalty] = useState("100");
  
  // School Details & ID Card Settings
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolLogo, setSchoolLogo] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [principalSignature, setPrincipalSignature] = useState("");
  const [ptaPresidentName, setPtaPresidentName] = useState("");
  const [ptaPresidentSignature, setPtaPresidentSignature] = useState("");
  const [idCardTemplate, setIdCardTemplate] = useState("wave-blue");
  const [customTemplateFront, setCustomTemplateFront] = useState("");
  const [customTemplateBack, setCustomTemplateBack] = useState("");

  const [userRole, setUserRole] = useState("ADMIN");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
      });

    fetch("/api/fees")
      .then(res => res.json())
      .then(data => setFeeCategories(data))
      .catch(console.error);
      
      // Fetch user role
      fetch("/api/auth/me")
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUserRole(data.user.role);
          }
        })
        .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        MEETING_ABSENCE_PENALTY: meetingPenalty,
        ASSEMBLY_ABSENCE_PENALTY: assemblyPenalty,
        VOLUNTARY_WORK_ABSENCE_PENALTY: voluntaryWorkPenalty,
        SCHOOL_NAME: schoolName,
        SCHOOL_ADDRESS: schoolAddress,
        SCHOOL_LOGO: schoolLogo,
        PRINCIPAL_NAME: principalName,
        PRINCIPAL_SIGNATURE: principalSignature,
        PTA_PRESIDENT_NAME: ptaPresidentName,
        PTA_PRESIDENT_SIGNATURE: ptaPresidentSignature,
        ID_CARD_TEMPLATE: idCardTemplate,
        CUSTOM_TEMPLATE_FRONT: customTemplateFront,
        CUSTOM_TEMPLATE_BACK: customTemplateBack,
      };
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) setMessage("Settings saved successfully.");
    } catch (err) {
      setMessage("Failed to save settings.");
    }
    setSaving(false);
  };

  const handleAddFee = async () => {
    if (!newFeeName || !newFeeAmount) return;
    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFeeName,
          amount: newFeeAmount,
          type: newFeeType,
          year: new Date().getFullYear()
        })
      });
      if (res.ok) {
        const fee = await res.json();
        setFeeCategories([...feeCategories, fee]);
        setNewFeeName("");
        setNewFeeAmount("");
        setIsAddingFee(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fee?")) return;
    try {
      const res = await fetch(`/api/fees/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFeeCategories(feeCategories.filter(f => f.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete fee");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <SettingsIcon size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-500 mt-1">Configure voluntary contributions and other global settings.</p>
          </div>
        </div>
        {userRole === "SUPER_ADMIN" && (
          <div className="flex items-center space-x-3">
            <a href="/settings/audit" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center shadow-sm">
              <span>Audit Trail</span>
            </a>
            <a href="/settings/archives" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center shadow-sm">
              <span>Archives</span>
            </a>
          </div>
        )}
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-8">
        
        {/* Fee Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Fee Categories</h2>
              <p className="text-sm text-slate-500">Define the specific fees parents must pay.</p>
            </div>
            <button 
              onClick={() => setIsAddingFee(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Fee</span>
            </button>
          </div>

          <div className="space-y-3">
            {feeCategories.length === 0 ? (
              <p className="text-slate-400 text-sm italic">No fees configured.</p>
            ) : (
              feeCategories.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900">{fee.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{fee.type === 'PER_PARENT' ? 'Per Parent' : 'Per Student'} • {fee.year}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="font-bold text-slate-900">₱{fee.amount}</p>
                    <button 
                      onClick={() => handleDeleteFee(fee.id)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}

            {isAddingFee && (
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fee Name</label>
                    <input 
                      type="text" 
                      value={newFeeName}
                      onChange={(e) => setNewFeeName(e.target.value)}
                      placeholder="e.g. PTA Fee"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount (₱)</label>
                    <input 
                      type="number" 
                      value={newFeeAmount}
                      onChange={(e) => setNewFeeAmount(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Charge Type</label>
                  <select 
                    value={newFeeType}
                    onChange={(e) => setNewFeeType(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm bg-white"
                  >
                    <option value="PER_STUDENT">Per Student (multiplied by # of children)</option>
                    <option value="PER_PARENT">Per Parent (flat fee per family)</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button 
                    onClick={() => setIsAddingFee(false)}
                    className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddFee}
                    className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium"
                  >
                    Save Fee
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Absence Penalties */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Event Absence Penalties</h2>
          <p className="text-sm text-slate-500 mb-4">Set the penalty amount automatically applied to parents who are absent from an event.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Meeting (₱)</label>
              <input 
                type="number" 
                value={meetingPenalty}
                onChange={(e) => setMeetingPenalty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assembly (₱)</label>
              <input 
                type="number" 
                value={assemblyPenalty}
                onChange={(e) => setAssemblyPenalty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Voluntary Work (₱)</label>
              <input 
                type="number" 
                value={voluntaryWorkPenalty}
                onChange={(e) => setVoluntaryWorkPenalty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900" 
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* School Details for ID Cards */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">ID Card Settings</h2>
          <p className="text-sm text-slate-500 mb-6">These details will be used to generate printable ID cards for the parents.</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Card Design Template</label>
              <select
                value={idCardTemplate}
                onChange={(e) => setIdCardTemplate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 bg-white"
              >
                <option value="wave-blue">Wave Blue</option>
                <option value="solid-navy">Solid Navy</option>
                <option value="modern-gray">Modern Gray</option>
                <option value="teal-angles">Teal Angles</option>
                <option value="diamond-blue">Diamond Blue</option>
                <option value="gold-blue">Gold & Blue</option>
                <option value="custom">Custom Uploaded Template</option>
              </select>
            </div>

            {idCardTemplate === "custom" && (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-6">
                <p className="text-sm text-indigo-800">
                  Upload your own blank ID card design images (CR80 size: 2.125" x 3.375" or 54mm x 86mm). 
                  The system will overlay the parent's photo, name, and QR code automatically.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Base64ImageUpload label="Custom Template (Front Background)" value={customTemplateFront} onChange={setCustomTemplateFront} />
                  <Base64ImageUpload label="Custom Template (Back Background)" value={customTemplateBack} onChange={setCustomTemplateBack} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">School Name</label>
                <input 
                  type="text" 
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Springfield Elementary"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">School Address</label>
                <input 
                  type="text" 
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  placeholder="e.g. 123 Evergreen Terrace"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900" 
                />
              </div>
            </div>

            <Base64ImageUpload label="School Logo" value={schoolLogo} onChange={setSchoolLogo} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Principal Name</label>
                  <input 
                    type="text" 
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    placeholder="e.g. Seymour Skinner"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900" 
                  />
                </div>
                <Base64ImageUpload label="Principal Signature" value={principalSignature} onChange={setPrincipalSignature} />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">PTA President Name</label>
                  <input 
                    type="text" 
                    value={ptaPresidentName}
                    onChange={(e) => setPtaPresidentName(e.target.value)}
                    placeholder="e.g. Marge Simpson"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900" 
                  />
                </div>
                <Base64ImageUpload label="PTA President Signature" value={ptaPresidentSignature} onChange={setPtaPresidentSignature} />
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-sm font-medium">
            {message}
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <Save size={20} />
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      {userRole === "SUPER_ADMIN" && (
        <div className="bg-white rounded-3xl shadow-sm border border-rose-200 overflow-hidden mt-8">
          <div className="p-6 border-b border-rose-100 bg-rose-50">
            <h2 className="text-xl font-bold text-rose-900">Danger Zone</h2>
            <p className="text-sm text-rose-700 mt-1">Irreversible administrative actions.</p>
          </div>
          <div className="p-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h3 className="font-semibold text-slate-900">Archive & Reset School Year</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Save a read-only snapshot of the current school year's records (parents, events, expenses) and clear the database for a fresh start.
                </p>
              </div>
              <ArchiveDatabaseButton />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h3 className="font-semibold text-slate-900">Clear All Archives</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Permanently delete all historical archive snapshots. This does not affect the live database.
                </p>
              </div>
              <ClearArchivesButton />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">Hard Reset Database</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Permanently delete all records without saving an archive. Your settings and admin accounts will be kept.
                </p>
              </div>
              <ResetDatabaseButton />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

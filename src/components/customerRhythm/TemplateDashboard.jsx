import React, { useState, useEffect } from "react";
import { Plus, RefreshCw, Search, Trash2, AlertCircle, CheckCircle2, Clock, PauseCircle, Copy } from "lucide-react";
import api from "../../api/apiconfig";
import { toast } from "react-toastify";

const TemplateDashboard = ({ onCreateNew, onCopyTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/integrationManagement/whatsapp/custom-templates");
      if (res.data.status) {
        setTemplates(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const syncTemplates = async () => {
    try {
      setSyncing(true);
      const res = await api.post("/api/integrationManagement/whatsapp/custom-templates/sync");
      if (res.data.status) {
        setTemplates(res.data.data);
        toast.success("Templates synced from Meta");
      }
    } catch (error) {
      console.error("Error syncing templates:", error);
      toast.error(error.response?.data?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const deleteTemplate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template? This will also delete it from Meta.")) return;
    try {
      const res = await api.delete(`/api/integrationManagement/whatsapp/custom-templates/${id}`);
      if (res.data.status) {
        setTemplates(templates.filter(t => t._id !== id));
        toast.success("Template deleted");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error(error.response?.data?.message || "Failed to delete template");
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"><CheckCircle2 size={12} /> Approved</span>;
      case "PENDING":
        return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"><Clock size={12} /> Pending</span>;
      case "REJECTED":
        return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"><AlertCircle size={12} /> Rejected</span>;
      case "PAUSED":
        return <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"><PauseCircle size={12} /> Paused</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "ALL" || t.category === filterCategory;
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#313166]/20 focus:border-[#313166]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-200 rounded-xl text-[#313166] focus:outline-none bg-white"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="MARKETING">Marketing</option>
            <option value="UTILITY">Utility</option>
            <option value="AUTHENTICATION">Authentication</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-200 rounded-xl text-[#313166] focus:outline-none bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={syncTemplates}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 text-[#313166] border border-[#313166] rounded-xl hover:bg-[#313166]/5 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Sync from Meta"}
          </button>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-[#313166] text-white rounded-xl hover:bg-[#3d3b83] transition-all shadow-md"
          >
            <Plus size={18} />
            Create Template
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-[#313166] text-sm font-medium">
              <tr>
                <th className="px-6 py-4">Template Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Language</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Quality</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">Loading templates...</td>
                </tr>
              ) : filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    No templates found. Create your first one!
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((template) => (
                  <tr key={template._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#313166]">{template.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-[#313166] bg-gray-100 px-2 py-1 rounded-lg">
                        {template.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#313166]">{template.language}</td>
                    <td className="px-6 py-4">{getStatusBadge(template.status)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold ${
                        template.qualityRating === 'HIGH' ? 'text-green-600' :
                        template.qualityRating === 'MEDIUM' ? 'text-yellow-600' :
                        template.qualityRating === 'LOW' ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {template.qualityRating || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onCopyTemplate?.(template)}
                          className="p-2 text-[#313166] hover:bg-[#313166]/10 rounded-lg transition-colors"
                          title="Copy Template"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          onClick={() => deleteTemplate(template._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Template"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TemplateDashboard;

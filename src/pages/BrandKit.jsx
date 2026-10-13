
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Palette,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Building2,
  Type,
  LoaderCircle,
  Search,
  RefreshCw,
} from "lucide-react";
import api from "../api/apiconfig";

const EMPTY_FORM = {
  businessName: "",
  logoUrl: "",
  brandColors: {
    primary: "#313166",
    secondary: "#FFFFFF",
    accent: "#FF3B93",
  },
  businessCategory: "",
  visualStyle: "",
  typography: "",
  brandVoice: "",
  description: "",
  referenceImages: [],
};

const inputClass =
  "w-full rounded-xl border border-[#E7EAF5] bg-[#F8F9FE] px-4 py-3 text-sm text-[#313166] outline-none transition placeholder:text-[#929AB9] focus:border-[#7777C8] focus:bg-white";

const labelClass =
  "mb-2 block text-sm font-medium text-[#343466]";

function BrandKit() {
  const [brandKits, setBrandKits] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadBrandKits = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/brand-kits");
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || "Unable to load brand kits.");
      }

      const items = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      setBrandKits(items);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load brand kits. Check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrandKits();
  }, [loadBrandKits]);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const updateColor = (field, value) => {
    setForm((previous) => ({
      ...previous,
      brandColors: {
        ...previous.brandColors,
        [field]: value,
      },
    }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      brandColors: { ...EMPTY_FORM.brandColors },
      referenceImages: [],
    });
    setError("");
    setNotice("");
    setShowForm(true);
  };

  const openEditForm = (kit) => {
    setEditingId(kit._id);
    setForm({
      ...EMPTY_FORM,
      ...kit,
      brandColors: {
        ...EMPTY_FORM.brandColors,
        ...(kit.brandColors || {}),
      },
      referenceImages: Array.isArray(kit.referenceImages)
        ? kit.referenceImages
        : [],
    });
    setError("");
    setNotice("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      brandColors: { ...EMPTY_FORM.brandColors },
      referenceImages: [],
    });
    setError("");
  };

  const saveBrandKit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      ...form,
      businessName: form.businessName.trim(),
      referenceImages: form.referenceImages
        .map((url) => url.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        await api.put(`/api/brand-kits/${editingId}`, payload);
        setNotice("Brand kit updated successfully.");
      } else {
        await api.post("/api/brand-kits", payload);
        setNotice("Brand kit created successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      await loadBrandKits();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save your brand kit. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteBrandKit = async (kit) => {
    const confirmed = window.confirm(
      `Delete "${kit.businessName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(kit._id);
    setError("");
    setNotice("");

    try {
      await api.delete(`/api/brand-kits/${kit._id}`);
      setBrandKits((previous) =>
        previous.filter((item) => item._id !== kit._id)
      );
      setNotice("Brand kit deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete this brand kit."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredKits = brandKits.filter((kit) =>
    `${kit.businessName || ""} ${kit.businessCategory || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full bg-[#F4F5FA] p-4 sm:p-6 lg:p-7">
      <div className="mx-auto max-w-[1500px] space-y-6">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-[#7E86AA]">
              <Palette size={17} />
              <span>Brand Management</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#29295D] sm:text-3xl">
              Business Brand Kit
            </h1>

            <p className="mt-2 text-sm text-[#838BAE] sm:text-base">
              Manage your business identity, colours and visual preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#313166] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#313166]/10 transition hover:bg-[#252550]"
          >
            <Plus size={18} />
            Add Brand Kit
          </button>
        </div>

        {/* Alerts */}
        {notice && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
            <button onClick={() => setNotice("")} type="button">
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              type="button"
              className="shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Create/Edit form */}
        {showForm && (
          <form
            onSubmit={saveBrandKit}
            className="overflow-hidden rounded-2xl border border-[#E8EAF5] bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-[#ECEEF7] px-5 py-5 sm:px-7">
              <div>
                <h2 className="text-lg font-bold text-[#313166]">
                  {editingId ? "Edit Brand Kit" : "Create Brand Kit"}
                </h2>
                <p className="mt-1 text-sm text-[#8991B1]">
                  Enter your business details and brand preferences.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelForm}
                className="rounded-xl p-2 text-[#737B9B] hover:bg-[#F1F2FA]"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-7 p-5 sm:p-7">
              <section>
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#313166]">
                  <Building2 size={18} />
                  Business Information
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Business / Brand Name *
                    </label>
                    <input
                      required
                      maxLength={150}
                      value={form.businessName}
                      onChange={(e) =>
                        updateField("businessName", e.target.value)
                      }
                      placeholder="Enter business name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Business Category</label>
                    <input
                      maxLength={100}
                      value={form.businessCategory}
                      onChange={(e) =>
                        updateField("businessCategory", e.target.value)
                      }
                      placeholder="e.g. Retail, Fashion, Food"
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Primary Logo URL</label>
                    <input
                      type="url"
                      value={form.logoUrl}
                      onChange={(e) => updateField("logoUrl", e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className={inputClass}
                    />
                    {form.logoUrl && (
                      <div className="mt-3 flex h-24 items-center justify-center rounded-xl border border-dashed border-[#DDE1F0] bg-[#F8F9FE] p-3">
                        <img
                          src={form.logoUrl}
                          alt="Brand logo preview"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.visibility = "hidden";
                          }}
                          onLoad={(e) => {
                            e.currentTarget.style.visibility = "visible";
                          }}
                        />
                      </div>
                    )}
                    <p className="mt-2 text-xs text-[#9097B4]">
                      Enter a publicly accessible image URL. File uploads are
                      not enabled in this version.
                    </p>
                  </div>
                </div>
              </section>

              <section className="border-t border-[#ECEEF7] pt-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#313166]">
                  <Palette size={18} />
                  Brand Colours
                </h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    ["primary", "Primary Colour"],
                    ["secondary", "Secondary Colour"],
                    ["accent", "Accent Colour"],
                  ].map(([key, title]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-[#EAECF6] bg-[#FAFAFE] p-4"
                    >
                      <label className={labelClass}>{title}</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={form.brandColors[key]}
                          onChange={(e) => updateColor(key, e.target.value)}
                          className="h-11 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
                          aria-label={title}
                        />
                        <input
                          value={form.brandColors[key]}
                          onChange={(e) =>
                            updateColor(key, e.target.value)
                          }
                          pattern="^#[0-9A-Fa-f]{6}$"
                          title="Enter a valid six-digit hex colour, e.g. #313166"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex h-14 overflow-hidden rounded-xl border border-[#EAECF6]">
                  <div
                    className="flex-1"
                    style={{ backgroundColor: form.brandColors.primary }}
                  />
                  <div
                    className="flex-1"
                    style={{ backgroundColor: form.brandColors.secondary }}
                  />
                  <div
                    className="flex-1"
                    style={{ backgroundColor: form.brandColors.accent }}
                  />
                </div>
              </section>

              <section className="border-t border-[#ECEEF7] pt-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#313166]">
                  <Type size={18} />
                  Brand Style & Voice
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Visual Style</label>
                    <select
                      value={form.visualStyle}
                      onChange={(e) =>
                        updateField("visualStyle", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">Select visual style</option>
                      <option value="Modern and minimal">Modern & Minimal</option>
                      <option value="Luxury and premium">Luxury & Premium</option>
                      <option value="Bold and vibrant">Bold & Vibrant</option>
                      <option value="Classic and elegant">Classic & Elegant</option>
                      <option value="Playful and creative">Playful & Creative</option>
                      <option value="Professional and corporate">
                        Professional & Corporate
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Typography Preference</label>
                    <select
                      value={form.typography}
                      onChange={(e) => updateField("typography", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select typography</option>
                      <option value="Sans-serif">Sans-serif</option>
                      <option value="Serif">Serif</option>
                      <option value="Modern geometric">Modern Geometric</option>
                      <option value="Elegant editorial">Elegant Editorial</option>
                      <option value="Rounded and friendly">Rounded & Friendly</option>
                      <option value="Bold display">Bold Display</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Brand Voice</label>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={form.brandVoice}
                      onChange={(e) =>
                        updateField("brandVoice", e.target.value)
                      }
                      placeholder="e.g. Friendly, trustworthy and professional"
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Business Description</label>
                    <textarea
                      rows={4}
                      maxLength={2000}
                      value={form.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      placeholder="Describe your business, products and target audience..."
                      className={inputClass}
                    />
                    <p className="mt-1 text-right text-xs text-[#929AB9]">
                      {form.description.length}/2000
                    </p>
                  </div>
                </div>
              </section>

              <section className="border-t border-[#ECEEF7] pt-6">
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-[#313166]">
                  <ImageIcon size={18} />
                  Reference Images
                </h3>

                <p className="mb-4 text-sm text-[#8991B1]">
                  Add up to 10 image URLs that represent your preferred brand
                  style.
                </p>

                <div className="space-y-3">
                  {form.referenceImages.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const images = [...form.referenceImages];
                          images[index] = e.target.value;
                          updateField("referenceImages", images);
                        }}
                        placeholder="https://example.com/reference-image.png"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            "referenceImages",
                            form.referenceImages.filter((_, i) => i !== index)
                          )
                        }
                        className="rounded-xl p-3 text-rose-500 hover:bg-rose-50"
                        aria-label="Remove reference image"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                {form.referenceImages.length < 10 && (
                  <button
                    type="button"
                    onClick={() =>
                      updateField("referenceImages", [
                        ...form.referenceImages,
                        "",
                      ])
                    }
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#DDE0F1] px-4 py-2.5 text-sm font-medium text-[#313166] transition hover:bg-[#F5F5FC]"
                  >
                    <Plus size={16} />
                    Add Reference Image
                  </button>
                )}
              </section>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#ECEEF7] bg-[#FAFAFE] px-5 py-4 sm:flex-row sm:px-7">
              <button
                type="button"
                onClick={cancelForm}
                disabled={saving}
                className="rounded-xl border border-[#DDE0F1] px-5 py-3 text-sm font-semibold text-[#555D83] hover:bg-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#313166] px-6 py-3 text-sm font-semibold text-white hover:bg-[#252550] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <LoaderCircle size={17} className="animate-spin" />}
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Brand Kit"}
              </button>
            </div>
          </form>
        )}

        {/* Saved brand kits */}
        <section className="overflow-hidden rounded-2xl border border-[#E9EBF5] bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-[#ECEEF7] p-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-[#313166]">
                Saved Brand Kits
              </h2>
              <p className="mt-1 text-sm text-[#8991B1]">
                {brandKits.length}{" "}
                {brandKits.length === 1 ? "brand kit" : "brand kits"} saved
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#929AB9]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search brand kits..."
                  className={`${inputClass} pl-10 sm:w-64`}
                />
              </div>
              <button
                type="button"
                onClick={loadBrandKits}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E4E7F3] px-4 py-3 text-sm font-medium text-[#313166] hover:bg-[#F8F9FE] disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-[#858DAD]">
              <LoaderCircle size={28} className="animate-spin text-[#7777C8]" />
              <p className="text-sm">Loading your brand kits...</p>
            </div>
          ) : filteredKits.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0F0FC] text-[#5555A0]">
                <Palette size={28} />
              </div>
              <h3 className="text-lg font-semibold text-[#313166]">
                {search ? "No matching brand kits" : "No brand kits yet"}
              </h3>
              <p className="mt-2 max-w-md text-sm text-[#8991B1]">
                {search
                  ? "Try another business name or category."
                  : "Create your first brand kit to keep your business identity and visual preferences together."}
              </p>
              {!search && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#313166] px-5 py-3 text-sm font-semibold text-white hover:bg-[#252550]"
                >
                  <Plus size={17} />
                  Create Your First Brand Kit
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3 sm:p-6">
              {filteredKits.map((kit) => (
                <article
                  key={kit._id}
                  className="overflow-hidden rounded-2xl border border-[#E7EAF5] bg-white transition hover:border-[#D2D5EF] hover:shadow-md"
                >
                  <div
                    className="h-2"
                    style={{
                      backgroundColor:
                        kit.brandColors?.primary || "#313166",
                    }}
                  />

                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E9EBF5] bg-[#F7F8FD]">
                        {kit.logoUrl ? (
                          <img
                            src={kit.logoUrl}
                            alt={`${kit.businessName} logo`}
                            className="h-full w-full object-contain p-1"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <Building2 size={23} className="text-[#7777AA]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-[#313166]">
                          {kit.businessName}
                        </h3>
                        <p className="mt-1 truncate text-sm text-[#8991B1]">
                          {kit.businessCategory || "Business category not set"}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 min-h-10 text-sm leading-5 text-[#737B9B]">
                      {kit.description
                        ? kit.description.length > 100
                          ? `${kit.description.slice(0, 100)}...`
                          : kit.description
                        : "No business description added."}
                    </p>

                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8991B1]">
                        Brand Palette
                      </p>
                      <div className="flex items-center gap-2">
                        {[
                          kit.brandColors?.primary || "#313166",
                          kit.brandColors?.secondary || "#FFFFFF",
                          kit.brandColors?.accent || "#FF3B93",
                        ].map((color, index) => (
                          <div
                            key={`${color}-${index}`}
                            title={color}
                            className="h-8 flex-1 rounded-lg border border-black/5"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {kit.visualStyle && (
                        <span className="rounded-full bg-[#F1F1FC] px-3 py-1 text-xs font-medium text-[#55559A]">
                          {kit.visualStyle}
                        </span>
                      )}
                      {kit.typography && (
                        <span className="rounded-full bg-[#FFF0F7] px-3 py-1 text-xs font-medium text-[#B72D70]">
                          {kit.typography}
                        </span>
                      )}
                    </div>

                    {kit.referenceImages?.length > 0 && (
                      <p className="mt-3 text-xs text-[#8991B1]">
                        {kit.referenceImages.length} reference image
                        {kit.referenceImages.length === 1 ? "" : "s"}
                      </p>
                    )}

                    <div className="mt-5 flex gap-2 border-t border-[#ECEEF7] pt-4">
                      <button
                        type="button"
                        onClick={() => openEditForm(kit)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#DDE0F1] px-3 py-2.5 text-sm font-semibold text-[#313166] transition hover:bg-[#F5F5FC]"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBrandKit(kit)}
                        disabled={deletingId === kit._id}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-100 px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                      >
                        {deletingId === kit._id ? (
                          <LoaderCircle size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default BrandKit;

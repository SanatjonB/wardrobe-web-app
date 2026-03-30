"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
// SmartBrand routes to /wardrobe if logged in, / if logged out
import { SmartBrand } from "@/components/smart-brand";
import "./add.css";
import "../../../page.css";

const CATEGORIES = [
  "Tops",
  "Bottoms",
  "Outerwear",
  "Shoes",
  "Accessories",
  "Dresses",
  "Activewear",
  "Loungewear",
];

export default function AddItemPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("#000000");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [autoFilled, setAutoFilled] = useState<Set<string>>(new Set());

  // Revoke the object URL when the component unmounts or the preview changes
  // to prevent memory leaks from dangling blob references
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }

    // Clean up the previous object URL before creating a new one
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setAutoFilled(new Set());

    // Run TF.js MobileNet classification + Canvas color extraction in parallel.
    // Both run entirely in the browser — no API cost.
    setAnalyzing(true);
    try {
      const img = new Image();
      await new Promise<void>((res) => {
        img.onload = () => res();
        img.onerror = () => res(); // resolve on error so analyzing always resets
        img.src = objectUrl;       // set src AFTER handlers to avoid race condition
      });

      const { extractDominantColor, classifyImage } = await import(
        "@/lib/image-analysis"
      );

      const [hexColor, result] = await Promise.all([
        Promise.resolve(extractDominantColor(img)),
        classifyImage(img),
      ]);

      const filled = new Set<string>();
      if (hexColor) {
        setColor(hexColor);
        filled.add("color");
      }
      if (result.category) {
        setCategory(result.category);
        filled.add("category");
      }
      setAutoFilled(filled);
    } catch {
      // Silent failure — user fills in manually if analysis doesn't work
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !category) {
      setError("Name and category are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated.");

      let image_url: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("wardrobe-images")
          .upload(path, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("wardrobe-images")
          .getPublicUrl(path);

        image_url = urlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("wardrobe_items")
        .insert({
          user_id: user.id,
          name: name.trim(),
          category,
          color,
          tags: tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean),
          image_url,
          uses: 0,
        });

      if (insertError) throw insertError;

      // Reset form so it's clean if the user navigates back and adds another item
      setName("");
      setCategory("");
      setColor("#000000");
      setTags("");
      setImageFile(null);
      setImagePreview(null);
      router.push("/wardrobe");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      // Always reset loading — whether success or error
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="container">
        {/* Nav — SmartBrand routes to /wardrobe if logged in, / if not */}
        <nav className="nav">
          <SmartBrand />
          <div className="nav-right">
            <Link href="/contact" className="nav-link">
              Contact
            </Link>
            <ThemeSwitcher />
          </div>
        </nav>

        <div className="add-page-header">
          <button className="back-btn" onClick={() => router.back()}>
            ← Back
          </button>
          <h1 className="wardrobe-title">Add Item</h1>
        </div>

        <div className="add-page-body">
          {/* Image upload — left column */}
          <div className="add-section-image">
            <p className="field-label">Photo</p>
            <div
              className="image-upload-lg"
              onClick={() => !analyzing && fileRef.current?.click()}
              style={
                imagePreview ? { backgroundImage: `url(${imagePreview})` } : {}
              }
            >
              {!imagePreview && (
                <>
                  <span className="upload-icon">📷</span>
                  <span className="upload-label">Click to upload a photo</span>
                  <span className="upload-sub">optional — JPG, PNG, WEBP</span>
                </>
              )}
              {analyzing && (
                <div className="analyzing-overlay">
                  <div className="spinner" />
                  <span className="analyzing-text">Analyzing…</span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImage}
              />
            </div>
            {imagePreview && !analyzing && (
              <button
                className="remove-image"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  setAutoFilled(new Set());
                }}
              >
                Remove photo
              </button>
            )}
            {/* Placeholder for the future paid Claude Vision analysis tier */}
            <button className="ai-stub-btn" disabled>
              ✨ Analyze with AI{" "}
              <span className="coming-soon-badge">Coming soon</span>
            </button>
          </div>

          {/* Name */}
          <div className="add-section">
            <label className="field-label">Name *</label>
            <input
              className="field-input"
              placeholder="e.g. White Oxford Shirt"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Category — badge appears when TF.js auto-detected it */}
          <div className="add-section">
            <label className="field-label">
              Category *
              {autoFilled.has("category") && (
                <span className="autofill-badge">auto-filled</span>
              )}
            </label>
            <div className="category-grid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`cat-btn ${category === cat ? "active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Color — badge appears when Canvas API extracted it from the photo */}
          <div className="add-section">
            <label className="field-label">
              Color
              {autoFilled.has("color") && (
                <span className="autofill-badge">auto-filled</span>
              )}
            </label>
            <div className="color-row">
              <input
                type="color"
                className="color-swatch"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <span className="color-hex">{color}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="add-section">
            <label className="field-label">Tags</label>
            <input
              className="field-input"
              placeholder="casual, work, summer  (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {error && <p className="add-error">{error}</p>}

          {/* Actions */}
          <div className="add-actions">
            <button
              className="btn-cancel"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving…" : "Add to Wardrobe"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

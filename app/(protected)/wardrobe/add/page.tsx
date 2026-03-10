"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
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

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="container">
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
              onClick={() => fileRef.current?.click()}
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
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImage}
              />
            </div>
            {imagePreview && (
              <button
                className="remove-image"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                Remove photo
              </button>
            )}
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

          {/* Category */}
          <div className="add-section">
            <label className="field-label">Category *</label>
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

          {/* Color */}
          <div className="add-section">
            <label className="field-label">Color</label>
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

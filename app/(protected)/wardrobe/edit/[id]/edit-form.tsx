"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { WardrobeItem } from "@/lib/types";

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

export function EditForm({ item }: { item: WardrobeItem }) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [color, setColor] = useState(item.color ?? "#000000");
  const [tags, setTags] = useState((item.tags ?? []).join(", "));
  const [imagePreview, setImagePreview] = useState<string | null>(
    item.image_url
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave() {
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

      let image_url = item.image_url;

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
      } else if (!imagePreview) {
        image_url = null;
      }

      const { error: updateError } = await supabase
        .from("wardrobe_items")
        .update({
          name: name.trim(),
          category,
          color,
          tags: tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean),
          image_url,
        })
        .eq("id", item.id);

      if (updateError) throw updateError;

      setLoading(false);
      router.push("/wardrobe");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("wardrobe_items")
        .delete()
        .eq("id", item.id);

      if (deleteError) throw deleteError;

      setDeleting(false);
      router.push("/wardrobe");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <main className="page">
      <div className="container">
        <div className="add-page-header">
          <button className="back-btn" onClick={() => router.back()}>
            ← Back
          </button>
          <h1 className="wardrobe-title">Edit Item</h1>
        </div>

        <div className="add-page-body">
          {/* Image */}
          <div className="add-section">
            <p className="field-label">Photo</p>
            <div
              className="image-upload-lg"
              onClick={() =>
                document.getElementById("edit-file-input")?.click()
              }
              style={
                imagePreview
                  ? { backgroundImage: `url(${imagePreview})` }
                  : {}
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
                id="edit-file-input"
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
              style={{ color: confirmDelete ? "#d94f4f" : undefined, borderColor: confirmDelete ? "#d94f4f" : undefined }}
              onClick={handleDelete}
              disabled={deleting || loading}
            >
              {deleting
                ? "Deleting…"
                : confirmDelete
                ? "Tap again to confirm"
                : "Delete Item"}
            </button>
            <button
              className="btn-cancel"
              onClick={() => router.back()}
              disabled={loading || deleting}
            >
              Cancel
            </button>
            <button
              className="btn-submit"
              onClick={handleSave}
              disabled={loading || deleting}
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

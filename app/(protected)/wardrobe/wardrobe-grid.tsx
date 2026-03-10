"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ITEMS_PER_PAGE = 6;

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

type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  color: string;
  tags: string[];
  uses: number;
  image_url: string | null;
};

type Props = {
  items: WardrobeItem[];
};

export function WardrobeGrid({ items }: Props) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Edit modal state
  const [editItem, setEditItem] = useState<WardrobeItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editColor, setEditColor] = useState("#000000");
  const [editTags, setEditTags] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((i) => i.category))).sort()],
    [items],
  );

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? items
        : items.filter((i) => i.category === activeCategory),
    [items, activeCategory],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const paginated = useMemo(
    () =>
      filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [filtered, currentPage],
  );

  function handleCategory(cat: string) {
    setActiveCategory(cat);
    setCurrentPage(1);
  }

  function openEdit(item: WardrobeItem) {
    setEditItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditColor(item.color ?? "#000000");
    setEditTags((item.tags ?? []).join(", "));
    setEditError(null);
  }

  function closeEdit() {
    setEditItem(null);
    setEditLoading(false);
    setEditError(null);
  }

  async function handleSave() {
    if (!editItem || !editName.trim() || !editCategory) {
      setEditError("Name and category are required.");
      return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("wardrobe_items")
        .update({
          name: editName.trim(),
          category: editCategory,
          color: editColor,
          tags: editTags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean),
        })
        .eq("id", editItem.id);
      if (error) throw error;
      closeEdit();
      router.refresh();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Something went wrong.");
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!editItem) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("wardrobe_items")
        .delete()
        .eq("id", editItem.id);
      if (error) throw error;
      closeEdit();
      router.refresh();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Something went wrong.");
      setEditLoading(false);
    }
  }

  async function handleWear(item: WardrobeItem) {
    const supabase = createClient();
    await supabase
      .from("wardrobe_items")
      .update({ uses: (item.uses ?? 0) + 1 })
      .eq("id", item.id);
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👗</div>
        <h2 className="empty-title">Your wardrobe is empty</h2>
        <p className="empty-sub">
          Add your first item to start tracking your closet.
        </p>
        <button
          className="add-btn"
          onClick={() => router.push("/wardrobe/add")}
        >
          + Add Your First Item
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Category filters */}
      <div className="filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-pill ${activeCategory === cat ? "active" : ""}`}
            onClick={() => handleCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="wardrobe-grid">
        {paginated.map((item) => (
          <div key={item.id} className="wardrobe-card">
            {item.image_url ? (
              <div
                className="card-swatch card-image"
                style={{ backgroundImage: `url(${item.image_url})` }}
              />
            ) : (
              <div
                className="card-swatch"
                style={{ background: item.color ?? "#e0e0e0" }}
              />
            )}
            <div className="card-body">
              <div className="card-top">
                <span className="card-name">{item.name}</span>
                <span className="card-category">{item.category}</span>
              </div>
              {item.tags?.length > 0 && (
                <div className="card-tags">
                  {item.tags.map((tag: string) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="card-footer">
                <button
                  className="card-uses-btn"
                  onClick={() => handleWear(item)}
                  title="Log a wear"
                >
                  Worn {item.uses ?? 0}× <span className="wear-plus">+1</span>
                </button>
                <button className="card-edit" onClick={() => openEdit(item)}>
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add card at end of last page */}
        {currentPage === totalPages && (
          <div
            className="wardrobe-card add-card"
            onClick={() => router.push("/wardrobe/add")}
          >
            <span className="add-icon">+</span>
            <span className="add-label">Add Item</span>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? "active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            →
          </button>
        </div>
      )}

      {/* Edit modal */}
      {editItem && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Item</h2>
              <button className="modal-close" onClick={closeEdit}>
                ✕
              </button>
            </div>

            <div className="modal-fields">
              <div className="field">
                <label className="field-label">Name *</label>
                <input
                  className="field-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label">Category *</label>
                <div className="category-grid">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className={`cat-btn ${editCategory === cat ? "active" : ""}`}
                      onClick={() => setEditCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="field-label">Color</label>
                <div className="color-row">
                  <input
                    type="color"
                    className="color-swatch"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                  />
                  <span className="color-hex">{editColor}</span>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Tags</label>
                <input
                  className="field-input"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="casual, work, summer"
                />
              </div>

              {editError && <p className="modal-error">{editError}</p>}
            </div>

            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={handleDelete}
                disabled={editLoading}
                style={{ color: "#d94f4f", borderColor: "#d94f4f" }}
              >
                Delete
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="modal-cancel"
                  onClick={closeEdit}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  className="modal-submit"
                  onClick={handleSave}
                  disabled={editLoading}
                >
                  {editLoading ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

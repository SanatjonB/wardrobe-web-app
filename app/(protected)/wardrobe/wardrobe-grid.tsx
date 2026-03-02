"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 6;

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

  const categories = [
    "All",
    ...Array.from(new Set(items.map((i) => i.category))).sort(),
  ];

  const filtered =
    activeCategory === "All"
      ? items
      : items.filter((i) => i.category === activeCategory);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  function handleCategory(cat: string) {
    setActiveCategory(cat);
    setCurrentPage(1);
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
                <span className="card-uses">Worn {item.uses ?? 0}×</span>
                <button className="card-edit">Edit</button>
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
    </>
  );
}

// src/api.ts
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const fetchBookmarks = async (userId: string) => {
  const res = await fetch(`${BASE_URL}/api/bookmarks/${userId}`);
  return res.json();
};

export const saveBookmarks = async (userId: string, bookmarks: any[]) => {
  return fetch(`${BASE_URL}/api/bookmarks/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookmarks }),
  });
};

export const fetchAnnotations = async (userId: string) => {
  const res = await fetch(`${BASE_URL}/api/annotations/${userId}`);
  return res.json();
};

export const saveAnnotations = async (
  userId: string,
  annotations: { key: string; note: string; color: string; html?: string }[]
) => {
  return fetch(`${BASE_URL}/api/annotations/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ annotations }),
  });
};

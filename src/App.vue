<template>
  <div
    class="bible-app"
    :class="{ 'dark-mode': isDarkMode, 'light-mode': !isDarkMode }"
  >
    <!-- Header with elegant controls -->
    <header class="bible-header">
      <div class="header-content">
        <h1 class="bible-title">
          <img :src="logo" alt="Logo" class="logo-image" />
        </h1>
        <div class="header-controls">
          <button @click="toggleBookmarks" class="control-btn bookmark-toggle">
            <span class="icon">📖</span>
          </button>
          <button
            @click="toggleAnnotations"
            class="control-btn annotation-toggle"
          >
            <span class="icon">📝</span>
          </button>
          <button @click="toggleDarkMode" class="control-btn theme-toggle">
            <span class="icon">{{ isDarkMode ? "☀️" : "🌙" }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Bible Interface -->
    <main class="bible-main">
      <!-- Book Selection Sidebar -->
      <aside class="book-sidebar">
        <!-- Book list -->
        <div class="sidebar-section" v-if="!showBookmarks && !showAnnotations">
          <h3 class="section-title">Books of the Bible</h3>

          <div class="testament-section">
            <select
              v-model="selectedBookName"
              @change="selectBook(selectedBookName)"
              class="book-select"
            >
              <option disabled value="">Select a Book</option>
              <option
                v-for="book in filteredBooks"
                :key="book.name"
                :value="book.name"
              >
                {{ book.name }}
              </option>
            </select>
          </div>
          <div class="search-bar-wrapper" ref="bookSearchRef">
            <input
              v-model="searchQuery"
              type="text"
              class="search-input-enhanced"
              placeholder="🔍 Search for a book..."
              @focus="showSuggestions = true"
            />

            <ul
              v-if="showSuggestions && searchQuery && filteredBooks.length > 0"
              class="suggestions-dropdown-enhanced"
            >
              <li
                v-for="book in filteredBooks"
                :key="book.name"
                @mousedown.prevent="selectBookFromDropdown(book.name)"
                class="suggestion-item-enhanced"
              >
                {{ book.name }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Bookmarks Sidebar ONLY -->
        <div class="sidebar-section" v-if="showBookmarks && !showAnnotations">
          <h3 class="section-title">Bookmarks</h3>
          <div v-if="bookmarks.length > 0" class="bookmark-list">
            <button
              v-for="bookmark in bookmarks"
              :key="bookmark.id"
              class="bookmark-item"
              @click="goToBookmark(bookmark)"
            >
              <span class="bookmark-text">
                {{ bookmark.book }} {{ bookmark.chapter }}:{{ bookmark.verse }}
              </span>
              <span
                @click.stop="removeBookmark(bookmark.id)"
                class="remove-btn"
                role="button"
                tabindex="0"
              >
                ×
              </span>
            </button>
          </div>
          <p v-else class="no-bookmarks">No bookmarks yet</p>
        </div>

        <!-- Annotations Sidebar ONLY -->
        <div class="sidebar-section" v-if="showAnnotations && !showBookmarks">
          <h3 class="section-title">Annotations</h3>
          <div
            v-if="Object.keys(verseAnnotations).length > 0"
            class="annotation-list"
          >
            <button
              v-for="(entry, key) in verseAnnotations"
              :key="key"
              class="bookmark-item"
              @click="goToAnnotation(key)"
            >
              <span class="bookmark-text">
                {{ key }} - {{ entry.note.slice(0, 30) }}...
              </span>
            </button>
          </div>
          <p v-else class="no-bookmarks">No annotations yet</p>
        </div>

        <!-- Chapters -->
        <div
          class="chapter-section"
          v-if="selectedBook && !showBookmarks && !showAnnotations"
        >
          <h3 class="section-title">Chapters</h3>
          <div class="chapter-grid">
            <button
              v-for="n in chapterCount"
              :key="n"
              class="chapter-btn"
              :class="{ active: selectedChapter === n }"
              @click="selectChapter(n)"
            >
              {{ n }}
            </button>
          </div>
        </div>
      </aside>

      <!-- Bible Pages -->
      <section class="bible-pages">
        <template v-if="selectedBook && selectedChapter">
          <div class="book-container">
            <div class="back-home-container">
              <button @click="goToHomepage" class="back-home-btn">
                ⬅ Back to Homepage
              </button>
            </div>
            <!-- Book and Chapter Navigation -->
            <div class="page-navigation">
              <!-- Chapter Arrows -->
              <button
                @click="previousChapter"
                :disabled="!canGoPrevious"
                class="nav-btn"
              >
                ‹ Chapter
              </button>
              <div class="current-reference">
                <span class="book-name">{{ selectedBook.name }}</span>
                <span class="chapter-number"
                  >Chapter {{ selectedChapter }}</span
                >
              </div>
              <button
                @click="nextChapter"
                :disabled="!canGoNext"
                class="nav-btn"
              >
                Chapter ›
              </button>
            </div>

            <!-- Bible Pages with Flip Animation -->
            <div class="pages-container">
              <div class="page-book" :class="{ 'page-turning': isPageTurning }">
                <!-- Left Page -->
                <div class="page left-page">
                  <div class="page-content">
                    <div class="page-header">
                      <span class="page-book-name">{{
                        selectedBook.name
                      }}</span>
                      <span class="page-chapter">{{ selectedChapter }}</span>
                    </div>
                    <transition-group
                      name="fade-slide"
                      tag="div"
                      class="verses-container"
                    >
                      <div
                        v-for="verse in leftPageVerses"
                        :key="'left-' + verse.verse"
                        class="verse"
                        :style="getHighlightStyle(verse)"
                        @click="openAnnotationModal(verse)"
                        @dblclick="addBookmark(verse)"
                      >
                        <span
                          class="verse-number"
                          :class="{ bookmarked: isBookmarked(verse) }"
                          @click.stop="toggleBookmark(verse)"
                          title="Click verse to bookmark"
                        >
                          {{ verse.verse }}
                        </span>

                        <span
                          class="verse-text"
                          v-html="getVerseHTML(verse)"
                        ></span>
                      </div>
                    </transition-group>
                  </div>
                </div>

                <!-- Right Page -->
                <div class="page right-page">
                  <div class="page-content">
                    <div class="page-header">
                      <span class="page-book-name">{{
                        selectedBook.name
                      }}</span>
                      <span class="page-chapter">{{ selectedChapter }}</span>
                    </div>
                    <transition-group
                      name="fade-slide"
                      tag="div"
                      class="verses-container"
                    >
                      <div
                        v-for="verse in rightPageVerses"
                        :key="'right-' + verse.verse"
                        class="verse"
                        :class="{
                          highlighted: highlightedVerse === verse.verse,
                        }"
                        @click="openAnnotationModal(verse)"
                        @dblclick="addBookmark(verse)"
                      >
                        <span
                          class="verse-number"
                          :class="{ bookmarked: isBookmarked(verse) }"
                          @click.stop="toggleBookmark(verse)"
                          title="Click to bookmark"
                        >
                          {{ verse.verse }}
                        </span>

                        <span
                          class="verse-text"
                          v-html="getVerseHTML(verse)"
                        ></span>
                      </div>
                    </transition-group>
                  </div>
                </div>

                <div class="page-spine"></div>
              </div>
            </div>

            <!-- Reading Controls -->
            <div class="reading-controls">
              <div class="font-control">
                <label for="fontSize">Font Size:</label>
                <input
                  id="fontSize"
                  type="range"
                  min="14"
                  max="24"
                  v-model="fontSize"
                  class="font-slider"
                />
                <span>{{ fontSize }}px</span>
              </div>
            </div>

            <!-- Bottom Chapter Navigation -->
            <div class="bottom-nav">
              <button
                @click="previousChapter"
                :disabled="!canGoPrevious"
                class="bottom-btn"
              >
                ‹ Prev
              </button>
              <span class="chapter-label">Chapter {{ selectedChapter }}</span>
              <button
                @click="nextChapter"
                :disabled="!canGoNext"
                class="bottom-btn"
              >
                Next ›
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <!-- Welcome Screen -->
          <div class="welcome-screen">
            <div class="welcome-content">
              <div class="bible-icon">📖</div>
              <h2>Welcome to my Bible!</h2>
              <p>Select a book from the sidebar</p>
              <div class="feature-list">
                <div class="feature">
                  <span class="feature-icon">👆</span>
                  <span>Highlight Verses to Highlight</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">💾</span>
                  <span>Click Verse Numbers to Bookmark</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">📄</span>
                  <span>Navigate with Page Turning</span>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div v-if="showAnnotationModal" class="modal-overlay">
          <div class="modal">
            <h3 class="modal-title">
              Annotation – Verse {{ annotationVerse?.verse }}
            </h3>
            <textarea
              v-model="annotationText"
              rows="4"
              class="annotation-input"
              placeholder="Type your note here..."
            ></textarea>
            <label for="highlightColor" style="margin-top: 0.5rem"
              >Highlight Color:</label
            >
            <input
              type="color"
              id="highlightColor"
              v-model="highlightColor"
              style="
                width: 100%;
                height: 40px;
                border: none;
                background: transparent;
                cursor: pointer;
              "
            />

            <div class="modal-actions">
              <button class="modal-btn save" @click="saveAnnotation">
                Save
              </button>
              <button
                class="modal-btn delete"
                @click="deleteAnnotation"
                v-if="annotationText"
              >
                Delete
              </button>
              <button
                class="modal-btn cancel"
                @click="showAnnotationModal = false"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import kjv from "./data/KJV.json";
import logo from "./data/church.png";

const searchSectionRef = ref<HTMLElement | null>(null);

function handleClickOutside(event: MouseEvent) {
  if (
    searchSectionRef.value &&
    !searchSectionRef.value.contains(event.target as Node)
  ) {
    showSuggestions.value = false;
  }
}

function isBookmarked(verse: Verse): boolean {
  if (!selectedBook.value || !selectedChapter.value) return false;
  const id = `${selectedBook.value.name}-${selectedChapter.value}-${verse.verse}`;
  return bookmarks.value.some((b) => b.id === id);
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

const searchQuery = ref("");
const selectedBookName = ref("");

const filteredBooks = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return books.value; // return all if query is empty
  return books.value.filter((b) => b.name.toLowerCase().startsWith(q));
});
const selectedText = ref("");

function getSelectedText() {
  const selection = window.getSelection();
  return selection?.toString().trim() || "";
}

function handleTextSelect(verse: Verse) {
  const selected = getSelectedText();

  // Only open modal if a non-empty text selection was made
  if (selected && selected.length > 1) {
    annotationVerse.value = verse;
    selectedText.value = selected;
    const key = getVerseKey(verse);
    annotationText.value = verseAnnotations.value[key]?.note || "";
    highlightColor.value = "#ffe58f";
    showAnnotationModal.value = true;
  }
}

const showAnnotations = ref(false);

const showAnnotationModal = ref(false);
const annotationVerse = ref<Verse | null>(null);
const annotationText = ref("");
const highlightColor = ref("#ffe58f");
const verseAnnotations = ref<
  Record<
    string,
    {
      html?: string; // optional for partial
      note: string;
      color: string; // always present
    }
  >
>({});

const showSuggestions = ref(false);

function selectBookFromDropdown(bookName: string) {
  selectedBookName.value = bookName;
  selectBook(bookName);
  // Clear search after selection
  searchQuery.value = "";
  showSuggestions.value = false;
}

function openAnnotationModal(verse: Verse) {
  annotationVerse.value = verse;
  selectedText.value = getSelectedText();
  const key = getVerseKey(verse);
  annotationText.value = verseAnnotations.value[key]?.note || "";
  highlightColor.value = "#ffe58f";
  showAnnotationModal.value = true;
}

function saveAnnotation() {
  if (!annotationVerse.value) return;

  const key = getVerseKey(annotationVerse.value);
  const originalText = annotationVerse.value.text;

  // If the user selected text, insert a span
  if (selectedText.value) {
    const escaped = selectedText.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const highlightedHTML = originalText.replace(
      regex,
      `<span style="background-color: ${highlightColor.value}">$&</span>`
    );

    verseAnnotations.value[key] = {
      html: highlightedHTML,
      note: annotationText.value.trim(),
      color: highlightColor.value,
    };
  } else {
    // fallback: full-verse color only
    verseAnnotations.value[key] = {
      note: annotationText.value.trim(),
      color: highlightColor.value,
    };
  }

  showAnnotationModal.value = false;
}

function deleteAnnotation() {
  if (annotationVerse.value) {
    const key = getVerseKey(annotationVerse.value);
    delete verseAnnotations.value[key];
  }
  showAnnotationModal.value = false;
}

function getHighlightStyle(verse: Verse) {
  const key = getVerseKey(verse);
  const annotation = verseAnnotations.value[key];
  return annotation && !annotation.html && annotation.color
    ? { backgroundColor: annotation.color }
    : {};
}

function getVerseKey(verse: Verse): string {
  return `${selectedBook.value?.name}-${selectedChapter.value}-${verse.verse}`;
}

function getVerseHTML(verse: Verse) {
  const key = getVerseKey(verse);
  return verseAnnotations.value[key]?.html || verse.text;
}

function toggleBookmarks() {
  showBookmarks.value = !showBookmarks.value;
  if (showBookmarks.value) showAnnotations.value = false;
}

function toggleAnnotations() {
  showAnnotations.value = !showAnnotations.value;
  if (showAnnotations.value) showBookmarks.value = false;
}
function goToAnnotation(key: string) {
  const parts = key.split("-");
  if (parts.length !== 3) return;

  const [bookName, chapterStr, verseStr] = parts;
  const chapter = parseInt(chapterStr);
  const verseNum = parseInt(verseStr);

  const book = books.value.find((b) => b.name === bookName);
  if (!book) return;

  selectedBook.value = book;
  showAnnotations.value = false;

  // Delay setting the chapter to ensure Vue updates the book
  setTimeout(() => {
    selectChapter(chapter);

    // Delay highlighting until verses load
    setTimeout(() => {
      highlightedVerse.value = verseNum;

      // Scroll to pages section
      const pages = document.querySelector(".pages-container");
      pages?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }, 100);
}

interface Verse {
  verse: number;
  text: string;
}

interface Chapter {
  chapter: number;
  verses: Verse[];
}

interface Book {
  name: string;
  chapters: Chapter[];
}

interface BibleData {
  translation: string;
  books: Book[];
}

interface Bookmark {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

const bibleData = kjv as BibleData;
const books = ref(bibleData.books);

// State
const selectedBook = ref<Book | null>(null);
const selectedChapter = ref<number | null>(null);
const verses = ref<Verse[]>([]);
const highlightedVerse = ref<number | null>(null);
const isDarkMode = ref(false);
const showBookmarks = ref(false);
const bookmarks = ref<Bookmark[]>([]);
const fontSize = ref(18);
const isPageTurning = ref(false);

const chapterCount = computed(() =>
  selectedBook.value ? selectedBook.value.chapters.length : 0
);

const canGoPrevious = computed(() => {
  if (!selectedBook.value || !selectedChapter.value) return false;
  return selectedChapter.value > 1;
});

const canGoNext = computed(() => {
  if (!selectedBook.value || !selectedChapter.value) return false;
  return selectedChapter.value < selectedBook.value.chapters.length;
});

// Split verses into left and right pages
const leftPageVerses = computed(() => {
  const midpoint = Math.ceil(verses.value.length / 2);
  return verses.value.slice(0, midpoint);
});

const rightPageVerses = computed(() => {
  const midpoint = Math.ceil(verses.value.length / 2);
  return verses.value.slice(midpoint);
});

// Watch fontSize and update CSS custom property
watch(fontSize, (newSize) => {
  document.documentElement.style.setProperty("--font-size", `${newSize}px`);
});

function goToHomepage() {
  selectedBook.value = null;
  selectedChapter.value = null;
  verses.value = [];
  highlightedVerse.value = null;
  searchQuery.value = "";
  selectedBookName.value = "";
  showSuggestions.value = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectBook(bookName: string) {
  const found = books.value.find((b) => b.name === bookName);
  if (found) {
    selectedBook.value = found;
    selectedChapter.value = null;
    verses.value = [];
    highlightedVerse.value = null;
    searchQuery.value = bookName;
  }
}

function selectChapter(chapterNumber: number) {
  if (isPageTurning.value) return;

  isPageTurning.value = true;

  setTimeout(() => {
    selectedChapter.value = chapterNumber;
    const chapter = selectedBook.value?.chapters.find(
      (c) => c.chapter === chapterNumber
    );
    verses.value = chapter?.verses || [];
    highlightedVerse.value = null;
    isPageTurning.value = false;

    const pages = document.querySelector(".pages-container");
    pages?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 300);
}

function previousChapter() {
  if (canGoPrevious.value && selectedChapter.value) {
    selectChapter(selectedChapter.value - 1);
  }
}

function nextChapter() {
  if (canGoNext.value && selectedChapter.value) {
    selectChapter(selectedChapter.value + 1);
  }
}

function toggleBookmark(verse: Verse) {
  if (!selectedBook.value || !selectedChapter.value) return;

  const id = `${selectedBook.value.name}-${selectedChapter.value}-${verse.verse}`;
  const index = bookmarks.value.findIndex((b) => b.id === id);

  if (index !== -1) {
    // Already bookmarked → remove it
    bookmarks.value.splice(index, 1);
  } else {
    // Not bookmarked → add it
    const bookmark: Bookmark = {
      id,
      book: selectedBook.value.name,
      chapter: selectedChapter.value,
      verse: verse.verse,
      text: verse.text.substring(0, 50) + "...",
    };
    bookmarks.value.push(bookmark);
  }
}

function addBookmark(verse: Verse) {
  if (!selectedBook.value || !selectedChapter.value) return;

  const bookmark: Bookmark = {
    id: `${selectedBook.value.name}-${selectedChapter.value}-${verse.verse}`,
    book: selectedBook.value.name,
    chapter: selectedChapter.value,
    verse: verse.verse,
    text: verse.text.substring(0, 50) + "...",
  };

  if (!bookmarks.value.find((b) => b.id === bookmark.id)) {
    bookmarks.value.push(bookmark);
  }
}

function removeBookmark(id: string) {
  bookmarks.value = bookmarks.value.filter((b) => b.id !== id);
}

function goToBookmark(bookmark: Bookmark) {
  const book = books.find((b) => b.name === bookmark.book);
  if (book) {
    selectedBook.value = book;
    selectChapter(bookmark.chapter);
    showBookmarks.value = false;
  }
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
}
</script>

<style scoped>
:root {
  --font-size: 18px;
  --rich-burgundy: #3b1f2b;
  --primary-color: #5a4634; /* Rich bronze for headings */
  --secondary-color: #a1876d; /* Muted camel brown */
  --accent-color: #c58b1c; /* Golden ochre */
  --text-color: #2b2b2b; /* Deep neutral text */
  --bg-color: #ece1d1; /* Parchment beige (main background) */
  --page-color: #f5ead8; /* Light tan (cards/pages) */
  --border-color: #c3a77a; /* Warm light brown */
  --shadow-color: rgba(90, 70, 52, 0.15); /* Subtle bronze shadow */
  --primary-gold: #ffd700;
}

.dark-mode {
  --warm-cream: #1a1a1a;
  --soft-parchment: #2d2d2d;
  --text-dark: #f0f0f0;
  --primary-gold: #ffd700;
}

.light-mode {
  --warm-cream: #fdf8ef;
  --soft-parchment: #fefbf5;
  --text-dark: #222222;
  --primary-gold: #ffd700;
  --rich-burgundy: #3b1f2b;
}
.logo-image {
  height: 80px; /* Shrink height */
  width: auto; /* Maintain aspect ratio */
  margin-right: 10px;
  vertical-align: middle;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.bible-app {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--warm-cream) 0%,
    var(--soft-parchment) 100%
  );
  font-family: "Crimson Text", "Times New Roman", serif;
  color: var(--text-dark);
  transition: all 0.4s ease;
}

.bible-header {
  background: var(--rich-burgundy);
  padding: 1rem 2rem;
  box-shadow: var(--shadow-soft);
  position: relative;
  overflow: hidden;
}

.modal {
  background: var(--page-color);
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--rich-burgundy);
  margin-bottom: 0.5rem;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--soft-parchment);
  border: 1px solid var(--border-color);
  border-top: none;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 10px 10px;
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.suggestion-item:hover {
  background: var(--primary-gold);
  color: white;
}

.annotation-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  background: var(--soft-parchment);
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.modal-btn {
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.modal-btn.save {
  background: var(--primary-gold);
  color: #222;
}

.modal-btn.delete {
  background: #ff6b6b;
  color: white;
}

.modal-btn.cancel {
  background: #ccc;
  color: #333;
}

.modal-btn:hover {
  opacity: 0.9;
}

.dark-mode .modal {
  background: #2c2c2c;
}

.dark-mode .annotation-input {
  background: #444;
  color: white;
}

.dark-mode .modal-btn.cancel {
  background: #555;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: var(--page-color);
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.modal h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.modal textarea {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.75rem;
  resize: vertical;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-actions button {
  background: var(--primary-gold);
  color: var(--text-dark);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.dark-mode .modal {
  background: #2d2d2d;
}

.dark-mode .modal textarea {
  background: #444;
  color: white;
}

.bottom-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2rem;
  padding: 1rem;
  background: var(--soft-parchment);
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 0 0 15px 15px;
}

.bottom-btn {
  background: var(--primary-gold);
  color: #222;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark-mode .bottom-btn {
  background: var(--primary-gold);
  color: white;
}

.bottom-btn:hover:not(:disabled) {
  background: var(--rich-burgundy);
  transform: translateY(-2px);
}

.bottom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chapter-label {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--rich-burgundy);
}

.bible-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(212, 175, 55, 0.1) 50%,
    transparent 100%
  );
  animation: shimmer 3s ease-in-out infinite;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes shimmer {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.bible-title {
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.holy {
  font-size: 1.8rem;
  color: var(--primary-gold);
  font-weight: 300;
  letter-spacing: 2px;
}

.bible {
  font-size: 2.5rem;
  color: white;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header-controls {
  display: flex;
  gap: 1rem;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid var(--primary-gold);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.control-btn:hover {
  background: var(--primary-gold);
  transform: scale(1.1);
}

.control-btn .icon {
  font-size: 1.5rem;
}

.bible-main {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
  padding: 2rem;
  min-height: calc(100vh - 100px);
}

.book-sidebar {
  background: #fffdf6;
  border: 2px solid #e0d4b7;
  color: #2f1b0c;
}

.book-select {
  width: 100%;
  min-width: 200px; /* Adjust as needed */
  max-width: 100%;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: 2px solid var(--primary-gold);
  border-radius: 10px;
  background: var(--soft-parchment);
  color: var(--text-dark);
  font-family: inherit;
  transition: all 0.3s ease;
}

.dark-mode .book-sidebar {
  background: var(--soft-parchment);
  border-color: rgba(212, 175, 55, 0.3);
}

.search-input {
  background: #fdf7ed;
  border: 1px solid #c4b08b;
  color: #3b2f25;
}

.section-title {
  color: var(--rich-burgundy);
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
  font-weight: bold;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--primary-gold),
    transparent
  );
}

.testament-section {
  margin-bottom: 2rem;
}

.testament-title {
  color: var(--royal-purple);
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.book-btn {
  padding: 0.75rem 1rem;
  background: var(--soft-parchment);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  color: var(--text-dark);
  font-weight: 500;
  text-align: center;
}

.book-btn:hover {
  background: var(--primary-gold);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.book-btn.active {
  background: var(--rich-burgundy);
  color: white;
  border-color: var(--rich-burgundy);
}

.chapter-section {
  position: sticky;
  top: 0;
  background: var(--soft-parchment);
  z-index: 3;
  padding-top: 1rem;
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  gap: 0.5rem;
}

.chapter-btn {
  padding: 0.75rem;
  background: var(--soft-parchment);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  color: var(--text-dark);
}

.chapter-btn:hover {
  background: var(--primary-gold);
  color: white;
  transform: scale(1.05);
}

.chapter-btn.active {
  background: var(--rich-burgundy);
  color: white;
  border-color: var(--rich-burgundy);
}

.bible-pages {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.book-container {
  background: linear-gradient(
    145deg,
    var(--warm-cream),
    var(--soft-parchment),
    #fffbe6
  );
}

.dark-mode .book-container {
  background: var(--soft-parchment);
}

.page-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(212, 175, 55, 0.2);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--rich-burgundy);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
}

.nav-btn:hover:not(:disabled) {
  background: var(--primary-gold);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

.current-reference {
  text-align: center;
}

.book-name {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--rich-burgundy);
  margin-bottom: 0.25rem;
}

.chapter-number {
  font-size: 1.2rem;
  color: var(--primary-gold);
  font-weight: 500;
}

.pages-container {
  perspective: 1000px;
  margin: 2rem 0;
}

.page-book {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  min-height: 600px;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
}

.page-book.page-turning {
  transform: rotateY(-15deg);
}

.page {
  background: var(--soft-parchment);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(212, 175, 55, 0.1);
  position: relative;
  overflow: hidden;
}

.dark-mode .page {
  background: #333;
  border-color: rgba(212, 175, 55, 0.2);
}

.page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(212, 175, 55, 0.03) 0%,
    transparent 50%,
    rgba(128, 0, 32, 0.03) 100%
  );
  pointer-events: none;
}

.left-page {
  border-right: 2px solid rgba(212, 175, 55, 0.1);
}

.page-spine {
  position: absolute;
  left: 50%;
  top: 5%;
  bottom: 5%;
  width: 2px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--primary-gold),
    transparent
  );
  transform: translateX(-50%);
  z-index: 10;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.page-book-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--rich-burgundy);
}

.page-chapter {
  font-size: 1rem;
  color: var(--primary-gold);
  font-weight: 500;
}

.verses-container {
  line-height: 1.8;
  font-size: var(--font-size);
}

.verse {
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.verse:hover {
  background: rgba(212, 175, 55, 0.1);
  transform: translateX(5px);
}

.verse.highlighted {
  background: linear-gradient(
    135deg,
    rgba(212, 175, 55, 0.2),
    rgba(128, 0, 32, 0.1)
  );
  border-left: 4px solid var(--primary-gold);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
}

.verse-number {
  display: inline-block;
  font-weight: bold;
  color: var(--rich-burgundy);
  background: rgba(212, 175, 55, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.9em;
  margin-right: 0.75rem;
  min-width: 2rem;
  text-align: center;
}

.verse-number.bookmarked {
  background: var(--primary-gold);
  color: white;
  transform: scale(1.1);
}

.verse-text {
  font-family: "Crimson Text", serif;
  line-height: 1.7;
}

.reading-controls {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--soft-parchment);
  border-radius: 15px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.dark-mode .reading-controls {
  background: #333;
}

.back-home-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.back-home-btn {
  background: var(--primary-gold);
  color: var(--text-dark);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-home-btn:hover {
  background: #e6c200;
  transform: translateY(-2px);
}

.dark-mode .back-home-btn {
  color: white;
}

.font-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 500;
}

.font-slider {
  flex: 1;
  max-width: 200px;
}

.welcome-screen {
  position: relative;
  z-index: 1; /* <-- ensure it stays behind the sidebar */
}

.dark-mode .welcome-screen {
  background: var(--soft-parchment);
}

.welcome-content {
  text-align: center;
  margin-bottom: 250px;
  max-width: 500px;
  padding: 3rem;
}

.bible-icon {
  font-size: 4rem;
  margin-bottom: 2rem;
}

.welcome-content h2 {
  font-size: 2.5rem;
  color: var(--rich-burgundy);
  margin-bottom: 1rem;
  font-weight: bold;
}

.welcome-content p {
  font-size: 1.2rem;
  color: var(--text-dark);
  opacity: 0.8;
  margin-bottom: 2rem;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--soft-parchment);
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.dark-mode .feature {
  background: #333;
}

.feature-icon {
  font-size: 1.5rem;
}

.bookmark-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bookmark-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--soft-parchment);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bookmark-item:hover {
  background: rgba(212, 175, 55, 0.1);
  transform: translateX(5px);
}

.bookmark-text {
  font-weight: 500;
}

.remove-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.no-bookmarks {
  text-align: center;
  color: var(--text-dark);
  opacity: 0.6;
  font-style: italic;
  padding: 2rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .bible-main {
    grid-template-columns: 280px 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .page-book {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .left-page {
    border-right: none;
    border-bottom: 2px solid rgba(212, 175, 55, 0.1);
  }

  .page-spine {
    display: none;
  }
}

@media (max-width: 768px) {
  .bible-main {
    grid-template-columns: 1fr;
  }

  .book-sidebar {
    order: 2;
    max-height: 400px;
  }

  .bible-pages {
    order: 1;
  }

  .holy {
    font-size: 1.4rem;
  }

  .bible {
    font-size: 2rem;
  }

  .page {
    padding: 1.5rem;
  }

  .book-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .chapter-grid {
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  }

  .page-navigation {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Scrollbar Styling */
.book-sidebar::-webkit-scrollbar {
  width: 8px;
}

.book-sidebar::-webkit-scrollbar-track {
  background: rgba(212, 175, 55, 0.1);
  border-radius: 10px;
}

.book-sidebar::-webkit-scrollbar-thumb {
  background: var(--primary-gold);
  border-radius: 10px;
}

.book-sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--rich-burgundy);
}

/* Enhanced Page Turning Animation */
@keyframes pageFlip {
  0% {
    transform: rotateY(0deg);
    opacity: 1;
  }
  50% {
    transform: rotateY(-90deg);
    opacity: 0.5;
  }
  100% {
    transform: rotateY(0deg);
    opacity: 1;
  }
}

.page-book.page-turning {
  animation: pageFlip 1.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Text Selection Styling */
::selection {
  background: rgba(212, 175, 55, 0.3);
  color: var(--rich-burgundy);
}

.search-bar-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input-enhanced {
  width: 100%;
  padding: 1.2rem 1.5rem 1.2rem 3rem;
  font-size: 1.1rem;
  border: 2px solid var(--border-color);
  border-radius: 16px;
  background: linear-gradient(135deg, var(--soft-parchment) 0%, #fefbf5 100%);
  color: var(--text-dark);
  font-family: "Crimson Text", serif;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 1px 3px rgba(255, 255, 255, 0.6);
  position: relative;
}

.search-input-enhanced::before {
  content: "🔍";
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: var(--primary-gold);
  pointer-events: none;
  z-index: 2;
}

.search-input-enhanced:focus {
  outline: none;
  border-color: var(--rich-burgundy);
  background: #fffdf4;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}

.suggestions-dropdown-enhanced {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background: var(--soft-parchment);
  border: 2px solid var(--primary-gold);
  border-top: none;
  border-radius: 0 0 12px 12px;
  max-height: 220px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.suggestion-item-enhanced {
  padding: 0.9rem 1.25rem;
  cursor: pointer;
  transition: background 0.25s ease, transform 0.25s ease;
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--rich-burgundy);
}

.suggestion-item-enhanced:hover {
  background: var(--primary-gold);
  color: white;
  transform: translateX(4px);
}

/* Focus Styles for Accessibility */
.book-btn:focus,
.chapter-btn:focus,
.nav-btn:focus,
.control-btn:focus {
  outline: 2px solid var(--primary-gold);
  outline-offset: 2px;
}

/* Loading Animation for Verse Changes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.verse {
  animation: fadeInUp 0.5s ease forwards;
}

.verse:nth-child(even) {
  animation-delay: 0.1s;
}

.verse:nth-child(odd) {
  animation-delay: 0.2s;
}

/* Enhanced Hover Effects */
.page:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.verse:hover .verse-number {
  background: var(--primary-gold);
  color: white;
  transform: scale(1.1);
}

body {
  font-family: Inter, sans-serif;
  margin: 0;
  padding: 0;
  background: var(--soft-parchment);
  color: var(--text-dark);
  font-size: 16px;
  line-height: 1.6;
}

.main-layout {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
}

.book-sidebar {
  background: var(--sidebar-color);
  padding: 1.5rem;
  overflow-y: auto;
  max-height: 100vh;
  width: 300px;
  box-sizing: border-box;
}

.bible-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.search-input {
  width: 100%;
  max-width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  border: 2px solid var(--primary-gold);
  border-radius: 12px;
  background: var(--soft-parchment);
  color: var(--text-dark);
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--rich-burgundy);
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
}

button,
.book-button,
.chapter-button {
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  min-height: 44px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }

  .book-sidebar {
    width: 100%;
    padding: 1rem;
    max-height: none;
  }

  .bible-main {
    width: 100%;
    padding: 1rem;
  }
}

/* Print Styles */
@media print {
  .bible-header,
  .book-sidebar,
  .page-navigation,
  .reading-controls {
    display: none;
  }

  .bible-main {
    grid-template-columns: 1fr;
  }

  .page {
    box-shadow: none;
    border: 1px solid #ccc;
  }

  .verse {
    break-inside: avoid;
  }
}
</style>

<style scoped>
*:not(input):not(textarea) {
  caret-color: transparent;
}
</style>

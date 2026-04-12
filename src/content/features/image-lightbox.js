// Image Lightbox feature - click to zoom images with pan support
import browser from "webextension-polyfill";

const STYLE_ID = "ghflex-image-lightbox-styles";
const MIN_IMAGE_SIZE = 200;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 5;
const ZOOM_STEP = 0.25;
const ZOOM_STEP_WHEEL = 0.1;

export const imageLightbox = {
  enabled: false,
  observer: null,
  processTimeout: null,
  lightbox: null,
  lightboxImg: null,
  lightboxZoom: null,
  currentZoom: 1,
  panX: 0,
  panY: 0,
  isDragging: false,
  imageClickHandlers: new Map(),

  enable() {
    if (this.enabled) return;
    this.injectStyles();
    this.createLightbox();
    this.processImages();
    this.setupObserver();
    this.enabled = true;
  },

  disable() {
    if (!this.enabled) return;
    clearTimeout(this.processTimeout);
    this.observer?.disconnect();
    this.closeLightbox();
    this.removeLightbox();
    this.removeImageTriggers();
    this.removeStyles();
    this.resetState();
    this.enabled = false;
  },

  resetState() {
    this.currentZoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
  },

  processImages() {
    const images = document.querySelectorAll(".markdown-body img");
    images.forEach((img) => {
      if (img.dataset.ghflexLightbox) return;

      // Handle images that haven't loaded yet
      if (!img.complete) {
        img.addEventListener("load", () => this.attachLightbox(img), {
          once: true,
        });
        return;
      }

      this.attachLightbox(img);
    });
  },

  attachLightbox(img) {
    if (img.dataset.ghflexLightbox) return;
    if (img.naturalWidth <= MIN_IMAGE_SIZE) return;

    img.dataset.ghflexLightbox = "true";
    img.classList.add("ghflex-lightbox-trigger");

    const handler = (e) => {
      e.preventDefault();
      this.openLightbox(img.src, img.alt);
    };

    this.imageClickHandlers.set(img, handler);
    img.addEventListener("click", handler);
  },

  createLightbox() {
    if (this.lightbox) return;

    const overlay = document.createElement("div");
    overlay.id = "ghflex-lightbox";
    overlay.innerHTML = `
      <div class="ghflex-lightbox-backdrop"></div>
      <div class="ghflex-lightbox-content">
        <div class="ghflex-lightbox-img-wrapper">
          <img class="ghflex-lightbox-img" src="" alt="" />
        </div>
        <div class="ghflex-lightbox-controls">
          <button class="ghflex-lightbox-btn" data-action="zoom-out" title="Zoom Out (-)">−</button>
          <span class="ghflex-lightbox-zoom">100%</span>
          <button class="ghflex-lightbox-btn" data-action="zoom-in" title="Zoom In (+)">+</button>
          <button class="ghflex-lightbox-btn" data-action="reset" title="Reset (0)">↺</button>
          <button class="ghflex-lightbox-btn ghflex-lightbox-close" data-action="close" title="Close (Esc)">✕</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.lightbox = overlay;
    this.lightboxImg = overlay.querySelector(".ghflex-lightbox-img");
    this.lightboxZoom = overlay.querySelector(".ghflex-lightbox-zoom");
    this.lightboxContent = overlay.querySelector(".ghflex-lightbox-content");

    // Click backdrop to close
    this.backdropHandler = () => this.closeLightbox();
    overlay
      .querySelector(".ghflex-lightbox-backdrop")
      .addEventListener("click", this.backdropHandler);

    // Button controls
    overlay.querySelectorAll(".ghflex-lightbox-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.handleAction(btn.dataset.action),
      );
    });

    // Keyboard
    this.handleKeydown = (e) => {
      if (!this.lightbox?.classList.contains("active")) return;
      switch (e.key) {
        case "Escape":
          this.closeLightbox();
          break;
        case "+":
        case "=":
          this.zoom(ZOOM_STEP);
          break;
        case "-":
          this.zoom(-ZOOM_STEP);
          break;
        case "0":
          this.resetZoom();
          break;
      }
    };
    document.addEventListener("keydown", this.handleKeydown);

    // Mouse wheel zoom
    this.handleWheel = (e) => {
      if (!this.lightbox?.classList.contains("active")) return;
      e.preventDefault();
      this.zoom(e.deltaY > 0 ? -ZOOM_STEP_WHEEL : ZOOM_STEP_WHEEL);
    };
    this.lightboxContent.addEventListener("wheel", this.handleWheel, {
      passive: false,
    });

    // Drag to pan
    this.setupDragPan();
  },

  setupDragPan() {
    const img = this.lightboxImg;
    let startX, startY, startPanX, startPanY;

    this.onMouseDown = (e) => {
      if (this.currentZoom <= 1) return;
      e.preventDefault();
      this.isDragging = true;
      img.classList.add("dragging");
      startX = e.clientX;
      startY = e.clientY;
      startPanX = this.panX;
      startPanY = this.panY;
    };

    this.onMouseMove = (e) => {
      if (!this.isDragging) return;
      this.panX = startPanX + (e.clientX - startX);
      this.panY = startPanY + (e.clientY - startY);
      this.updateTransform();
    };

    this.onMouseUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      img.classList.remove("dragging");
    };

    img.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  },

  openLightbox(src, alt) {
    if (!this.lightbox) return;
    this.lightboxImg.src = src;
    this.lightboxImg.alt = alt || "";
    this.resetZoom();
    this.lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  closeLightbox() {
    if (!this.lightbox) return;
    this.lightbox.classList.remove("active");
    document.body.style.overflow = "";
  },

  handleAction(action) {
    switch (action) {
      case "zoom-in":
        this.zoom(ZOOM_STEP);
        break;
      case "zoom-out":
        this.zoom(-ZOOM_STEP);
        break;
      case "reset":
        this.resetZoom();
        break;
      case "close":
        this.closeLightbox();
        break;
    }
  },

  zoom(delta) {
    const oldZoom = this.currentZoom;
    this.currentZoom = Math.max(
      ZOOM_MIN,
      Math.min(ZOOM_MAX, this.currentZoom + delta),
    );
    if (this.currentZoom <= 1 && oldZoom > 1) {
      this.panX = 0;
      this.panY = 0;
    }
    this.updateTransform();
    this.updateZoomDisplay();
  },

  resetZoom() {
    this.currentZoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.updateTransform();
    this.updateZoomDisplay();
  },

  updateTransform() {
    if (!this.lightboxImg) return;
    this.lightboxImg.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.currentZoom})`;
  },

  updateZoomDisplay() {
    if (!this.lightboxZoom) return;
    this.lightboxZoom.textContent = `${Math.round(this.currentZoom * 100)}%`;
  },

  setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      let shouldProcess = false;
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          shouldProcess = true;
          break;
        }
      }
      if (shouldProcess) {
        clearTimeout(this.processTimeout);
        this.processTimeout = setTimeout(() => this.processImages(), 300);
      }
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
  },

  removeImageTriggers() {
    document.querySelectorAll(".ghflex-lightbox-trigger").forEach((img) => {
      const handler = this.imageClickHandlers.get(img);
      if (handler) {
        img.removeEventListener("click", handler);
        this.imageClickHandlers.delete(img);
      }
      img.classList.remove("ghflex-lightbox-trigger");
      delete img.dataset.ghflexLightbox;
    });
  },

  removeLightbox() {
    if (this.handleKeydown) {
      document.removeEventListener("keydown", this.handleKeydown);
    }
    if (this.onMouseMove) {
      document.removeEventListener("mousemove", this.onMouseMove);
    }
    if (this.onMouseUp) {
      document.removeEventListener("mouseup", this.onMouseUp);
    }
    this.lightbox?.remove();
    this.lightbox = null;
    this.lightboxImg = null;
    this.lightboxZoom = null;
    this.lightboxContent = null;
  },

  injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const link = document.createElement("link");
    link.id = STYLE_ID;
    link.rel = "stylesheet";
    link.href = browser.runtime.getURL("content/styles/image-lightbox.css");
    document.head.appendChild(link);
  },

  removeStyles() {
    document.getElementById(STYLE_ID)?.remove();
  },
};

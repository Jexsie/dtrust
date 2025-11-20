/**
 * Content Script
 * Runs on all web pages to scan for verifiable assets
 */

import { AssetTarget, AssetTargetType } from "../utils/types";

// DTRUST verification API URL
const DTRUST_VERIFY_URL = "http://localhost:3001/api/v1/verify";

/**
 * Create a status icon element
 */
function createStatusIcon(
  status: "pending" | "verified" | "not-verified" | "too-large" | "error"
): HTMLElement {
  const icon = document.createElement("span");
  icon.className = "dtrust-status-icon";
  icon.setAttribute("data-dtrust-status", status);

  // Styling
  icon.style.display = "inline-block";
  icon.style.width = "16px";
  icon.style.height = "16px";
  icon.style.marginLeft = "4px";
  icon.style.verticalAlign = "middle";
  icon.style.borderRadius = "50%";
  icon.style.cursor = "pointer";
  icon.title = `Dtrust Status: ${status}`;

  // Set color based on status
  switch (status) {
    case "pending":
      icon.style.backgroundColor = "#gray";
      icon.style.border = "2px solid #gray";
      break;
    case "verified":
      icon.style.backgroundColor = "#22c55e";
      icon.style.border = "2px solid #22c55e";
      break;
    case "not-verified":
      icon.style.backgroundColor = "#ef4444";
      icon.style.border = "2px solid #ef4444";
      break;
    case "too-large":
      icon.style.backgroundColor = "#f59e0b";
      icon.style.border = "2px solid #f59e0b";
      break;
    case "error":
      icon.style.backgroundColor = "#6b7280";
      icon.style.border = "2px solid #6b7280";
      break;
  }

  return icon;
}

/**
 * Get a unique selector for an element
 */
function getElementSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }

  if (element.className) {
    const classes = element.className
      .split(" ")
      .filter((c) => c)
      .join(".");
    if (classes) {
      return `.${classes}`;
    }
  }

  // Fallback: use tag name and position
  const parent = element.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(element);
    return `${element.tagName.toLowerCase()}:nth-child(${index + 1})`;
  }

  return element.tagName.toLowerCase();
}

/**
 * Level 1: Find asset links (PDFs, EPUBs, ZIPs, etc.)
 */
function findAssetLinks(): AssetTarget[] {
  const targets: AssetTarget[] = [];
  const fileExtensions = [
    ".pdf",
    ".epub",
    ".zip",
    ".mp4",
    ".cert",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
  ];

  const links = document.querySelectorAll<HTMLAnchorElement>("a[href]");

  links.forEach((link) => {
    const href = link.href.toLowerCase();
    const hasFileExtension = fileExtensions.some((ext) => href.includes(ext));

    if (hasFileExtension) {
      targets.push({
        type: "FILE_URL",
        value: link.href,
        elementSelector: getElementSelector(link),
        elementId: link.id || undefined,
      });
    }
  });

  return targets;
}

/**
 * Level 2: Find product identifiers (SKUs, product IDs)
 */
function findProductIdentifiers(): AssetTarget[] {
  const targets: AssetTarget[] = [];

  // Find elements with itemprop="sku"
  const skuElements = document.querySelectorAll('[itemprop="sku"]');
  skuElements.forEach((element) => {
    const value =
      element.textContent?.trim() || element.getAttribute("content") || "";
    if (value) {
      targets.push({
        type: "PRODUCT_ID",
        value: value,
        elementSelector: getElementSelector(element as HTMLElement),
        elementId: (element as HTMLElement).id || undefined,
      });
    }
  });

  // Find elements with data-product-id
  const productIdElements = document.querySelectorAll("[data-product-id]");
  productIdElements.forEach((element) => {
    const value = element.getAttribute("data-product-id") || "";
    if (value) {
      targets.push({
        type: "PRODUCT_ID",
        value: value,
        elementSelector: getElementSelector(element as HTMLElement),
        elementId: (element as HTMLElement).id || undefined,
      });
    }
  });

  return targets;
}

/**
 * Level 3: Find custom DTRUST attributes
 */
function findCustomDtrustAttributes(): AssetTarget[] {
  const targets: AssetTarget[] = [];

  const dtrustElements = document.querySelectorAll("[data-dtrust-asset]");
  dtrustElements.forEach((element) => {
    const value = element.getAttribute("data-dtrust-asset") || "";
    if (value) {
      targets.push({
        type: "CUSTOM_ATTRIBUTE",
        value: value,
        elementSelector: getElementSelector(element as HTMLElement),
        elementId: (element as HTMLElement).id || undefined,
      });
    }
  });

  return targets;
}

/**
 * Inject status icons next to target elements
 */
function injectStatusIcons(targets: AssetTarget[]): void {
  targets.forEach((target) => {
    try {
      const element = document.querySelector(
        target.elementSelector
      ) as HTMLElement;
      if (element && !element.querySelector(".dtrust-status-icon")) {
        const icon = createStatusIcon("pending");
        element.appendChild(icon);
      }
    } catch (error) {
      console.error("Error injecting status icon:", error);
    }
  });
}

/**
 * Update status icon based on verification result
 */
function updateStatusIcon(
  selector: string,
  status: "verified" | "not-verified" | "too-large" | "error"
): void {
  try {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      const icon = element.querySelector(".dtrust-status-icon") as HTMLElement;
      if (icon) {
        const newIcon = createStatusIcon(status);
        icon.replaceWith(newIcon);
      }
    }
  } catch (error) {
    console.error("Error updating status icon:", error);
  }
}

/**
 * Main scanning function
 */
function scanPage(): void {
  console.log("[DTRUST] Scanning page for verifiable assets...");

  // Collect all targets
  const assetLinks = findAssetLinks();
  const productIds = findProductIdentifiers();
  const customAttributes = findCustomDtrustAttributes();

  const allTargets = [...assetLinks, ...productIds, ...customAttributes];

  console.log(
    `[DTRUST] Found ${allTargets.length} potential targets:`,
    allTargets
  );

  // Inject status icons
  injectStatusIcons(allTargets);

  // Send targets to service worker for verification
  if (allTargets.length > 0) {
    // Send targets to service worker for verification
    chrome.runtime.sendMessage(
      {
        type: "VERIFY_TARGETS",
        targets: allTargets,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "[DTRUST] Error sending message:",
            chrome.runtime.lastError
          );
          return;
        }

        // Response will be handled via onMessage listener below
        console.log("[DTRUST] Verification request sent");
      }
    );
  }
}

/**
 * Listen for verification results from service worker
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "VERIFICATION_RESULT") {
    const { selector, status } = message;
    updateStatusIcon(selector, status);
    sendResponse({ success: true });
    return true; // Keep message channel open for async response
  }
  return false;
});

// Run scan when page is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scanPage);
} else {
  scanPage();
}

// Re-scan when new content is added (for dynamic pages)
const observer = new MutationObserver((mutations) => {
  let shouldRescan = false;
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      shouldRescan = true;
    }
  });
  if (shouldRescan) {
    // Debounce rescanning
    setTimeout(scanPage, 1000);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

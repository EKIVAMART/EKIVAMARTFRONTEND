'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

export default function TawkWidget() {
  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null;
    let dragOverlay: HTMLElement | null = null;

    const findTawkContainers = (): HTMLElement[] => {
      const selectors = [
        '#tawk-bubble-container',
        'iframe[title*="chat"]',
        'iframe[src*="tawk.to"]',
        'div[id^="tawk-"]',
        'div[class*="tawk-min-container"]',
      ];
      const found: HTMLElement[] = [];
      for (const sel of selectors) {
        const elements = document.querySelectorAll<HTMLElement>(sel);
        elements.forEach((el) => {
          let container: HTMLElement | null = el;
          if (el.tagName === 'IFRAME') {
            container = (el.closest('div[style*="position: fixed"]') as HTMLElement) || el.parentElement;
          }
          if (container) {
            const style = window.getComputedStyle(container);
            if (
              (style.position === 'fixed' || container.style.position === 'fixed') &&
              style.display !== 'none' &&
              container.offsetWidth > 0
            ) {
              if (!found.includes(container)) {
                found.push(container);
              }
            }
          }
        });
      }
      return found;
    };

    const attachDragHandle = (container: HTMLElement) => {
      if (container.dataset.tawkHandleAttached === 'true') return;
      container.dataset.tawkHandleAttached = 'true';

      container.style.setProperty('overflow', 'visible', 'important');

      const handle = document.createElement('div');
      handle.className = 'tawk-drag-pill-handle';
      handle.style.cssText = `
        position: absolute !important;
        top: -36px !important;
        right: 8px !important;
        z-index: 2147483647 !important;
        cursor: move !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        touch-action: none !important;
        pointer-events: auto !important;
      `;

      handle.innerHTML = `
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #0f172a;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 5px 12px;
          border-radius: 9999px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.2);
          letter-spacing: 0.2px;
          white-space: nowrap;
          cursor: move;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
            <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
          </svg>
          <span>Move Widget</span>
        </div>
      `;

      container.appendChild(handle);

      let currentX = 0;
      let currentY = 0;
      let startX = 0;
      let startY = 0;

      const getPos = (e: MouseEvent | TouchEvent) => {
        if ('touches' in e && e.touches && e.touches.length > 0) {
          return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        if ('changedTouches' in e && e.changedTouches && e.changedTouches.length > 0) {
          return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        }
        const me = e as MouseEvent;
        return { x: me.clientX ?? 0, y: me.clientY ?? 0 };
      };

      const startDrag = (e: MouseEvent | TouchEvent) => {
        if (e.cancelable) {
          e.preventDefault();
        }
        e.stopPropagation();

        const pos = getPos(e);
        startX = pos.x - currentX;
        startY = pos.y - currentY;

        if (!dragOverlay) {
          dragOverlay = document.createElement('div');
          dragOverlay.style.cssText = `
            position: fixed !important;
            inset: 0 !important;
            z-index: 2147483647 !important;
            cursor: move !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            touch-action: none !important;
            background: transparent !important;
          `;
          document.body.appendChild(dragOverlay);
        }

        const moveDrag = (moveEv: MouseEvent | TouchEvent) => {
          if (moveEv.cancelable) {
            moveEv.preventDefault();
          }
          moveEv.stopPropagation();

          const movePos = getPos(moveEv);
          let nextX = movePos.x - startX;
          let nextY = movePos.y - startY;

          const rect = container.getBoundingClientRect();
          const width = rect.width || 60;
          const height = rect.height || 60;

          const originLeft = rect.left - currentX;
          const originTop = rect.top - currentY;

          const minX = 10 - originLeft;
          const maxX = window.innerWidth - originLeft - width - 10;
          const minY = 10 - originTop;
          const maxY = window.innerHeight - originTop - height - 10;

          nextX = Math.max(minX, Math.min(nextX, maxX));
          nextY = Math.max(minY, Math.min(nextY, maxY));

          currentX = nextX;
          currentY = nextY;

          container.style.setProperty('transform', `translate3d(${currentX}px, ${currentY}px, 0px)`, 'important');
        };

        const stopDrag = () => {
          if (dragOverlay && dragOverlay.parentNode) {
            dragOverlay.parentNode.removeChild(dragOverlay);
            dragOverlay = null;
          }

          window.removeEventListener('mousemove', moveDrag);
          window.removeEventListener('touchmove', moveDrag);
          window.removeEventListener('mouseup', stopDrag);
          window.removeEventListener('touchend', stopDrag);
          window.removeEventListener('touchcancel', stopDrag);
        };

        window.addEventListener('mousemove', moveDrag, { passive: false });
        window.addEventListener('touchmove', moveDrag, { passive: false });
        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('touchend', stopDrag);
        window.addEventListener('touchcancel', stopDrag);
      };

      handle.addEventListener('mousedown', startDrag);
      handle.addEventListener('touchstart', startDrag, { passive: false });
    };

    const scanAndAttach = () => {
      const containers = findTawkContainers();
      containers.forEach(attachDragHandle);
    };

    checkInterval = setInterval(scanAndAttach, 500);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (dragOverlay && dragOverlay.parentNode) {
        dragOverlay.parentNode.removeChild(dragOverlay);
      }
    };
  }, []);

  return (
    <>
      <Script id="tawk-init" strategy="afterInteractive">
        {`var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();`}
      </Script>
      <Script
        id="tawk-script"
        strategy="afterInteractive"
        src="https://embed.tawk.to/6a8ccce732c63a3448b62764/1k0r00qf1"
        crossOrigin="anonymous"
        charSet="UTF-8"
      />
    </>
  );
}


// ==============================================================================
// 미래스마트산업진흥원 — UI inspect 일련번호 인스펙션 및 4대 정보 복사 엔진
// 규격 문서: docs/UI-inspects.md 및 .agents/rules/ui-tagging-inspection.md
// ==============================================================================

export function initUiInspector() {
  if (typeof window === 'undefined') return;

  // 1. 인스펙터 전용 스타일 주입 (중복 주입 방지)
  if (!document.getElementById('ui-inspector-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'ui-inspector-styles';
    styleEl.textContent = `
      .ui-serial-badge {
        display: none;
        position: absolute;
        top: -8px;
        left: -2px;
        z-index: 99999;
        background: linear-gradient(135deg, #3182F6 0%, #6366F1 100%);
        color: #ffffff;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 9.5px;
        font-weight: 700;
        line-height: 1;
        padding: 2.5px 5.5px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(49, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2);
        cursor: pointer;
        pointer-events: auto;
        user-select: none;
        letter-spacing: -0.2px;
        transition: transform 0.15s ease, background 0.15s ease;
      }
      .ui-serial-badge:hover {
        transform: scale(1.12);
        background: linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%);
      }
      .ui-serial-badge.copied {
        background: #10B981 !important;
        transform: scale(1.08);
      }
      body.ui-inspect-active .ui-serial-badge {
        display: inline-flex !important;
        animation: uiTagPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes uiTagPopIn {
        from { opacity: 0; transform: scale(0.7); }
        to { opacity: 1; transform: scale(1); }
      }
      /* 관리자 좌측 메뉴 뱃지 위치 일치 (타 뱃지와 동일하게 좌상단 핀 고정) */
      .sidebar-item .ui-serial-badge {
        top: -6px !important;
        left: 8px !important;
        right: auto !important;
        transform: none !important;
      }
      .sidebar-item .ui-serial-badge:hover {
        transform: scale(1.12) !important;
      }
      #ui-tagger-toast {
        position: fixed;
        bottom: 74px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(8px);
        color: #ffffff;
        font-size: 13px;
        font-weight: 600;
        padding: 10px 18px;
        border-radius: 30px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
        z-index: 100000;
        pointer-events: none;
        opacity: 0;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        text-align: center;
        white-space: nowrap;
      }
      #ui-tagger-toast.ui-toast-show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      #ui-inspector-fab {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 99998;
        background: #ffffff;
        color: #0284c7;
        border: 1px solid #E2E8F0;
        padding: 7px 14px;
        border-radius: 24px;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      #ui-inspector-fab:hover {
        background: #F8FAFC;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);
      }
      body.ui-inspect-active #ui-inspector-fab {
        background: #0284c7;
        color: #ffffff;
        border-color: #0284c7;
        box-shadow: 0 4px 16px rgba(2, 132, 199, 0.4);
      }
    `;
    document.head.appendChild(styleEl);
  }

  // URL 쿼리 파라미터 inspect=1 확인
  let isInspectMode = window.location.search.includes('inspect=1');

  function updateState() {
    document.body.classList.toggle('ui-inspect-active', isInspectMode);
    const fabText = document.getElementById('ui-inspector-fab-text');
    if (fabText) {
      fabText.innerText = isInspectMode ? 'UI inspect ON (Alt+I)' : 'UI inspect (Alt+I)';
    }
  }

  // 2. 단축키 리스너 (Alt + I 또는 Ctrl + Shift + T)
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.altKey && e.key.toLowerCase() === 'i') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't')) {
      e.preventDefault();
      isInspectMode = !isInspectMode;
      updateState();
      showToast(isInspectMode ? '🔍 UI inspect 활성화 (클릭 시 4대 정보 복사)' : 'UI inspect 비활성화 (숨김)');
    }
  };
  window.removeEventListener('keydown', handleKeyDown);
  window.addEventListener('keydown', handleKeyDown);

  // 3. 플로팅 토글 버튼 (FAB) 마운트
  let fab = document.getElementById('ui-inspector-fab');
  if (!fab) {
    fab = document.createElement('button');
    fab.id = 'ui-inspector-fab';
    fab.setAttribute('type', 'button');
    fab.setAttribute('title', '단축키 Alt+I 로 UI inspect 모드를 켜고 끌 수 있습니다');
    fab.innerHTML = `<span>🏷️</span><span id="ui-inspector-fab-text">${isInspectMode ? 'UI inspect ON (Alt+I)' : 'UI inspect (Alt+I)'}</span>`;
    fab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isInspectMode = !isInspectMode;
      updateState();
      showToast(isInspectMode ? '🔍 UI inspect 활성화 (클릭 시 4대 정보 복사)' : 'UI inspect 비활성화 (숨김)');
    });
    document.body.appendChild(fab);
  }

  // 4. 뱃지 클릭 시 4대 핵심 정보 클립보드 복사
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const badge = target.closest('.ui-serial-badge') as HTMLElement | null;
    if (!badge) return;

    e.preventDefault();
    e.stopPropagation();

    const serialId = badge.getAttribute('data-serial-id') || badge.innerText.trim();
    const pageName = document.title || '미래스마트산업진흥원';
    const uri = window.location.href;
    const container = badge.parentElement;

    let itemName = badge.getAttribute('data-item-name') || container?.getAttribute('data-item-name') || '';
    if (!itemName && container) {
      const clone = container.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.ui-serial-badge').forEach((b) => b.remove());
      itemName = (clone.textContent || '').replace(/\s+/g, ' ').trim().substring(0, 40);
    }
    if (!itemName) itemName = serialId;

    const copyText = [
      `- 일련번호: ${serialId}`,
      `- 페이지명: ${pageName}`,
      `- URI: ${uri}`,
      `- 항목명: ${itemName}`,
    ].join('\n');

    const copyToClipboard = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(copyText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = copyText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return Promise.resolve();
      }
    };

    copyToClipboard().then(() => {
      const originalText = badge.innerText;
      badge.innerText = 'Copied! ✓';
      badge.classList.add('copied');
      setTimeout(() => {
        badge.innerText = originalText;
        badge.classList.remove('copied');
      }, 1200);
      showToast(`📋 [${serialId}] 4대 정보 복사 완료! (일련번호/페이지/URI/항목명)`);
    });
  };

  document.removeEventListener('click', handleClick, true);
  document.addEventListener('click', handleClick, true);

  function showToast(msg: string) {
    let toast = document.getElementById('ui-tagger-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ui-tagger-toast';
      document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.className = 'ui-toast-show';
    setTimeout(() => {
      if (toast) toast.className = '';
    }, 2400);
  }

  updateState();
}

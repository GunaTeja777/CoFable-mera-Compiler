/**
 * Splitter Module for CoFable Studio
 * Manages the draggable splitter divider between the code editor and terminal output panels.
 */

export interface SplitterConfig {
  editorPanel: HTMLElement;
  outputPanel: HTMLElement;
  resizer: HTMLElement;
  mainLayout: HTMLElement;
  toggleBtn: HTMLButtonElement;
}

export class PanelSplitter {
  private editorPanel: HTMLElement;
  private outputPanel: HTMLElement;
  private resizer: HTMLElement;
  private mainLayout: HTMLElement;
  private toggleBtn: HTMLButtonElement;

  private isDragging = false;
  private isCollapsed = false;
  private currentPercent = 70; // Default 70% editor / 30% terminal
  private transitionTimeout: number | null = null;

  constructor(config: SplitterConfig) {
    this.editorPanel = config.editorPanel;
    this.outputPanel = config.outputPanel;
    this.resizer = config.resizer;
    this.mainLayout = config.mainLayout;
    this.toggleBtn = config.toggleBtn;

    this.init();
  }

  private init() {
    // 1. Load initial state from localStorage
    const savedPercent = localStorage.getItem('cofable_editor_width');
    if (savedPercent) {
      this.currentPercent = parseFloat(savedPercent);
    }
    
    const savedCollapsed = localStorage.getItem('cofable_terminal_collapsed');
    this.isCollapsed = savedCollapsed === 'true';

    // 2. Set up initial visual states
    this.applyLayoutState(false);

    // 3. Bind Event Listeners
    this.resizer.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.resizer.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    this.resizer.addEventListener('dblclick', this.onDoubleClick.bind(this));
    this.toggleBtn.addEventListener('click', this.toggleTerminal.bind(this));

    // Keyboard shortcut (Ctrl + `)
    window.addEventListener('keydown', (e) => {
      // Check if Ctrl + ` is pressed
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        this.toggleTerminal();
      }
    });

    // Handle window resize (making sure constraints are kept)
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && !this.isCollapsed) {
        this.applyLayoutState(false);
      }
    });
  }

  /**
   * Applies the current splitter percentages and collapsed state to the DOM
   * @param animate Whether to use transition animation
   */
  private applyLayoutState(animate = true) {
    // Clear any pending transition timeout
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
    }

    if (window.innerWidth < 768) {
      // Reset styles for mobile/stacked layout (handled by CSS media queries)
      this.editorPanel.style.width = '';
      this.outputPanel.style.width = '';
      this.outputPanel.style.display = '';
      this.outputPanel.style.opacity = '';
      this.resizer.style.display = 'none';
      return;
    }

    if (animate) {
      this.editorPanel.classList.add('transitioning');
      this.outputPanel.classList.add('transitioning');
    } else {
      this.editorPanel.classList.remove('transitioning');
      this.outputPanel.classList.remove('transitioning');
    }

    if (this.isCollapsed) {
      // Collapse terminal completely
      this.editorPanel.style.width = '100%';
      this.outputPanel.style.opacity = '0';
      this.toggleBtn.textContent = 'Expand';
      this.toggleBtn.title = 'Expand Terminal (Ctrl+`)';
      
      // Delay display:none until transition completes
      if (animate) {
        this.transitionTimeout = window.setTimeout(() => {
          this.outputPanel.style.display = 'none';
          this.resizer.style.display = 'none';
          this.editorPanel.classList.remove('transitioning');
          this.outputPanel.classList.remove('transitioning');
        }, 300);
      } else {
        this.outputPanel.style.display = 'none';
        this.resizer.style.display = 'none';
      }
    } else {
      // Normal expanded layout
      this.outputPanel.style.display = 'flex';
      this.resizer.style.display = 'block';
      // Force layout recalculation if display was none
      void this.outputPanel.offsetHeight;

      this.editorPanel.style.width = `${this.currentPercent}%`;
      this.outputPanel.style.opacity = '1';
      this.toggleBtn.textContent = 'Collapse';
      this.toggleBtn.title = 'Collapse Terminal (Ctrl+`)';

      // Update ARIA attributes
      this.resizer.setAttribute('aria-valuenow', this.currentPercent.toFixed(0));

      if (animate) {
        this.transitionTimeout = window.setTimeout(() => {
          this.editorPanel.classList.remove('transitioning');
          this.outputPanel.classList.remove('transitioning');
        }, 300);
      }
    }
  }

  /**
   * Toggles the terminal collapsed state
   */
  public toggleTerminal() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('cofable_terminal_collapsed', String(this.isCollapsed));
    this.applyLayoutState(true);
  }

  /**
   * Reset layout back to 70/30 split on double click
   */
  private onDoubleClick() {
    if (window.innerWidth < 768 || this.isCollapsed) return;
    this.currentPercent = 70;
    localStorage.setItem('cofable_editor_width', '70');
    this.applyLayoutState(true);
  }

  /**
   * Mouse Drag Handlers
   */
  private onMouseDown(e: MouseEvent) {
    if (window.innerWidth < 768 || this.isCollapsed) return;
    e.preventDefault();
    this.startDragging();
  }

  private onTouchStart(_e: TouchEvent) {
    if (window.innerWidth < 768 || this.isCollapsed) return;
    this.startDragging();
  }

  private startDragging() {
    this.isDragging = true;
    this.resizer.classList.add('dragging');
    this.editorPanel.classList.remove('transitioning');
    this.outputPanel.classList.remove('transitioning');

    // Prevent cursor/text selection flickering while dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    // Bind document move/up events for capture
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);

    document.addEventListener('mousemove', this.onMove);
    document.addEventListener('mouseup', this.onEnd);
    document.addEventListener('touchmove', this.onMove, { passive: false });
    document.addEventListener('touchend', this.onEnd);
  }

  private onMove(e: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    // Prevent scrolling on mobile touch
    if (e.type === 'touchmove') {
      e.preventDefault();
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const layoutRect = this.mainLayout.getBoundingClientRect();
    const relativeX = clientX - layoutRect.left;
    
    // Convert to percentage
    let newPercent = (relativeX / layoutRect.width) * 100;

    // Convert pixel limits to percentages
    // Editor Min: 350px
    const minEditorPercent = (350 / layoutRect.width) * 100;
    // Terminal Min: 250px (subtracting splitter width of 6px)
    const minTerminalPercent = ((layoutRect.width - 250 - 6) / layoutRect.width) * 100;

    // Clamp values
    newPercent = Math.max(minEditorPercent, Math.min(newPercent, minTerminalPercent));

    this.currentPercent = newPercent;
    this.editorPanel.style.width = `${newPercent}%`;
    this.resizer.setAttribute('aria-valuenow', newPercent.toFixed(0));
  }

  private onEnd() {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.resizer.classList.remove('dragging');

    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    localStorage.setItem('cofable_editor_width', String(this.currentPercent));

    document.removeEventListener('mousemove', this.onMove);
    document.removeEventListener('mouseup', this.onEnd);
    document.removeEventListener('touchmove', this.onMove);
    document.removeEventListener('touchend', this.onEnd);
  }
}

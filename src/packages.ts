/**
 * Package Manager for PyFable 
 * Manages loading micropip and installing packages from PyPI.
 */

export class PackageManager {
  private pyodide: any;
  private installedPackages: Set<string> = new Set(['builtins', 'sys']);
  private onListUpdate?: (packages: string[]) => void;

  constructor(pyodideInstance: any, onListUpdate?: (packages: string[]) => void) {
    this.pyodide = pyodideInstance;
    this.onListUpdate = onListUpdate;
  }

  /**
   * Initializes micropip.
   */
  public async initMicropip(): Promise<void> {
    if (!this.pyodide) throw new Error("Pyodide is not loaded yet");
    await this.pyodide.loadPackage("micropip");
  }

  /**
   * Installs a package from PyPI.
   * @param name The package name (e.g. "numpy", "sympy")
   * @param onStatus Callback to update loading progress text
   */
  public async install(name: string, onStatus: (msg: string) => void): Promise<void> {
    const pkg = name.trim().toLowerCase();
    if (!pkg) return;

    if (this.installedPackages.has(pkg)) {
      onStatus(`Package "${pkg}" is already installed!`);
      return;
    }

    onStatus(`Downloading & installing "${pkg}" from PyPI…`);

    try {
      // Import micropip inside Pyodide
      const micropip = this.pyodide.pyimport("micropip");
      
      // Run the install promise
      await micropip.install(pkg);
      
      // Add to set of installed packages
      this.installedPackages.add(pkg);
      onStatus(`✓ Successfully installed "${pkg}"`);
      
      if (this.onListUpdate) {
        this.onListUpdate(this.getInstalledPackages());
      }
    } catch (e: any) {
      console.error(e);
      onStatus(`✗ Failed to install "${pkg}": ${e.message || String(e)}`);
      throw e;
    }
  }

  /**
   * Returns list of currently installed packages in this session.
   */
  public getInstalledPackages(): string[] {
    return Array.from(this.installedPackages);
  }
}

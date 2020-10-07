export class Proxy {
  private static RESOLVE_PROXY_TEST_URL = "https://no.where";
  private static DIRECT_PROXY_TEST_URL = "DIRECT";

  /**
   * Resolve system proxy if exists
   */
  public static resolve(rootBrowserWindow: Electron.BrowserWindow): Promise<string> {
    return new Promise(resolve => {
      rootBrowserWindow.webContents.session.resolveProxy(Proxy.RESOLVE_PROXY_TEST_URL).then((proxy: string) => {
        const httpProxy = proxy !== Proxy.DIRECT_PROXY_TEST_URL ? "http://" + proxy.replace("PROXY", "").trim() : null;
        resolve(httpProxy);
      });
    });
  }
}

/// <reference types="vite/client" />

import type { Root } from "react-dom/client";

declare global {
  interface Window {
    __APP_ROOT__?: Root;
  }
}

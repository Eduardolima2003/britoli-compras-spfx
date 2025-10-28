// src/pnpjsconfig.ts

import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI } from "@pnp/sp";

// A função SPFx é importada diretamente de "@pnp/sp" (não de "@pnp/spfx-context")
import { SPFx } from "@pnp/sp/presets/all"; // Este é o preset mais estável

let _sp: SPFI | null = null; 

export function getSP(context?: WebPartContext): SPFI { 
  if (context && !_sp) {
    // Usamos o método .using() com o preset SPFx importado
    _sp = spfi().using(SPFx(context)); 
  }

  return _sp as SPFI;
}
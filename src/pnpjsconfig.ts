// src/pnpjsconfig.ts

import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI } from "@pnp/sp";

let _sp: SPFI | null = null; 

export function getSP(context?: WebPartContext): SPFI { 
  if (context && !_sp) {
    // Usa o método .setup() para configurar o contexto SPFx.
    _sp = spfi().setup({ 
        spfxContext: context,
    });
  }

  return _sp as SPFI;
}
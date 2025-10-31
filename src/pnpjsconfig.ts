import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI } from "@pnp/sp"; 
import "@pnp/sp/webs"; 
import "@pnp/sp/lists"; 
import "@pnp/sp/items"; 


import { SPFx } from "@pnp/sp/behaviors/spfx"; 


export function getSP(context: WebPartContext): SPFI { 
    
    const sp = spfi(); 
    
    
    sp.using(SPFx(context));
    
    return sp;
}
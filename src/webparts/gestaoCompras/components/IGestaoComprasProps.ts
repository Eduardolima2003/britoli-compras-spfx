import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IPedido } from "./IPedidos";

export interface IGestaoComprasProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
  pedido: IPedido;


}

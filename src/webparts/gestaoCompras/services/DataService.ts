import { IPedido } from '../components/IPedidos';
import { SPFI } from '@pnp/sp';
import { getSP } from '../../../pnpjsconfig';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";

// Usando o nome EXATO da sua lista
const LIST_NAME = "Mensagens de Compra";

/**
 * Interface auxiliar para o objeto de dados que será enviado ao SharePoint.
 */
interface INewPedidoData {
    Title: string;
    Referencia: string;
    Fornecedor: string;
    Status: string;
    ValorTotal: number;
    Prioridade: string;
    DataEntregaEstimada: Date;
    CompradorId: number; // ID do usuário do SharePoint
}

/**
 * Serviço responsável por interagir com a lista do SharePoint usando PnPjs.
 */
export class DataService {
    private _sp: SPFI;

    constructor(context: WebPartContext) {
        this._sp = getSP(context);
    }

    /**
     * Busca pedidos filtrando pelo campo Status na lista do SharePoint.
     */
    public async getPedidosByStatus(status: string): Promise<IPedido[]> {

        try {
            // Seleciona os campos
            const items = await this._sp.web.lists.getByTitle(LIST_NAME).items
                .select(
                    "Id",
                    "Referencia",
                    "Fornecedor",
                    "Comprador/Title",
                    "Status",
                    "ValorTotal",
                    "Prioridade",
                    "DataEntregaEstimada",
                    "Created"
                )
                .expand("Comprador")
                .filter(`Status eq '${status}'`)
                .orderBy("Created", false)
                ();

            // Mapeia os dados brutos do SharePoint para a interface IPedido
            const pedidos: IPedido[] = items.map(item => ({
                Id: item.Id,
                Referencia: item.Referencia || 'N/A',
                Fornecedor: item.Fornecedor || 'Não Informado',
                Comprador: item.Comprador?.Title || 'Sem Comprador',
                Status: item.Status || 'Status Desconhecido',
                ValorTotal: item.ValorTotal || 0,
                Prioridade: item.Prioridade || 'Baixa',
                DataCriacao: new Date(item.Created),
                DataEntregaEstimada: item.DataEntregaEstimada ? new Date(item.DataEntregaEstimada) : new Date(),
            }));

            return pedidos;

        } catch (error) {
            console.error(`Erro ao buscar pedidos na lista '${LIST_NAME}'.`, error);
            return [];
        }
    }

    /**
     * Busca o ID do usuário do SharePoint (User Id) a partir do seu e-mail de login.
     */
    private async getUserIdByLoginName(loginName: string): Promise<number> {
        if (!loginName) return 0;
        try {
            // Chamada ensureUser
            const userResult = await this._sp.web.ensureUser(loginName.trim());
            // Acessa o ID aninhado dentro da propriedade 'data'
            return userResult.data.Id;
        } catch (error) {
            console.error("Erro ao buscar ID do usuário:", error);
            // Fallback: Tenta usar o usuário atual se o e-mail inserido não for encontrado
            try {
                // Chamada currentUser
                const currentUser = await this._sp.web.currentUser;
                console.warn("E-mail não encontrado, usando o usuário logado como Comprador.");
                // CORREÇÃO FINAL: Usando Type Assertion para acessar o ID (que sabemos ser maiúsculo em runtime)
                return (currentUser as any).Id;
            } catch {
                return 0;
            }
        }
    }

    /**
     * Adiciona um novo pedido de compra à lista.
     */
    public async addNewPedido(data: Omit<INewPedidoData, 'CompradorId'> & { CompradorEmail: string }): Promise<void> {

        // 1. Busca o ID do usuário usando o e-mail fornecido
        const userId = await this.getUserIdByLoginName(data.CompradorEmail);

        if (!userId) {
            throw new Error("Não foi possível identificar o Comprador no SharePoint. Verifique se o e-mail está correto.");
        }

        // 2. Monta o payload (o objeto a ser enviado)
        const itemPayload: INewPedidoData = {
            Title: data.Title,
            Referencia: data.Referencia,
            Fornecedor: data.Fornecedor,
            Status: data.Status,
            ValorTotal: data.ValorTotal,
            Prioridade: data.Prioridade,
            DataEntregaEstimada: data.DataEntregaEstimada,
            CompradorId: userId,
        };

        // 3. Salva no SharePoint
        try {
            await this._sp.web.lists.getByTitle(LIST_NAME).items.add(itemPayload);
        } catch (error) {
            console.error(`Erro ao adicionar novo pedido na lista '${LIST_NAME}'.`, error);
            throw new Error(`Erro ao salvar pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
}
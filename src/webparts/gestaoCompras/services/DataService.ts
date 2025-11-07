import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI, spfi, SPFx } from '@pnp/sp';
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import { IPedido } from '../components/IPedidos';

/**
 * Serviço de dados para interagir com a lista de pedidos no SharePoint.
 */
export class DataService {
    private sp: SPFI;
    private readonly listTitle: string = "Mensagens de Compra";
    private readonly CAMPO_DATA_ENTREGA = 'DataEntregaEstimada';

    constructor(private context: WebPartContext) {
        this.sp = spfi().using(SPFx(this.context));
    }

    private async getUserIdByEmail(email: string): Promise<number> {
        if (!email) {
            return 0;
        }
        try {
            // Usa o PnP para buscar o usuário pelo login (que geralmente é o e-mail)
            const user = await this.sp.web.siteUsers.getByLoginName(`i:0#.f|membership|${email}`).select("Id")();
            return user.Id;
        } catch (e) {
            console.error(`Usuário com e-mail ${email} não encontrado ou erro de permissão:`, e);
            // IMPORTANTE: Se o usuário não for encontrado, lança-se um erro para o formulário tratar
            throw new Error(`O comprador '${email}' não foi encontrado no SharePoint ou você não tem permissão para buscá-lo.`);
        }
    }

    private mapToIPedido(item: any): IPedido {
        const dataCriacao = item.Created ? new Date(item.Created) : new Date();
        const dataEntrega = item[this.CAMPO_DATA_ENTREGA] ? new Date(item[this.CAMPO_DATA_ENTREGA]) : undefined;
        const compradorValor = item.Comprador && item.Comprador.EMail ? item.Comprador.EMail :
            (item.Comprador && item.Comprador.Title ? item.Comprador.Title : "N/D");

        return {
            ID: item.ID,
            Title: item.Title || "N/D",
            Status: item.Status || "RECEBIDO",
            Prioridade: item.Prioridade || "BAIXA",
            Fornecedor: item.Fornecedor || "N/D",
            Comprador: compradorValor,
            Referencia: item.Referencia || "N/D",
            ValorTotal: item.ValorTotal || 0,
            DataCriacao: dataCriacao,
            DataEntrega: dataEntrega,
        };
    }

    public async getPedidosByStatus(status: string): Promise<IPedido[]> {
        try {

            let selectFields = [
                "ID", "Title", "Status", "Prioridade", "Fornecedor",
                "Referencia", "ValorTotal", "Created",
                this.CAMPO_DATA_ENTREGA
            ];

            // Adicionando a projeção do campo Comprador (Pessoa/Grupo)
            selectFields.push("Comprador/Title");
            //
            selectFields.push("Comprador/Title", "Comprador/EMail");

            const items = await this.sp.web.lists.getByTitle(this.listTitle).items
                .filter(`Status eq '${status}'`)
                .expand("Comprador")
                .select(...selectFields)
                ();


            return items.map(this.mapToIPedido.bind(this));
        } catch (e) {
            console.error("Erro ao buscar pedidos por status:", e);
            throw e;
        }
    }

    public async addPedido(pedido: Omit<IPedido, 'ID' | 'DataCriacao'>): Promise<void> {
        try {

            let compradorId = 0;
            if (pedido.Comprador) {

                compradorId = await this.getUserIdByEmail(pedido.Comprador);
            }

            const itemPayload: any = {
                Title: pedido.Title,
                Status: pedido.Status,
                Prioridade: pedido.Prioridade,
                Fornecedor: pedido.Fornecedor,

                CompradorId: compradorId > 0 ? compradorId : null,
                Referencia: pedido.Referencia,
                ValorTotal: pedido.ValorTotal,
            };

            if (pedido.DataEntrega) {
                itemPayload[this.CAMPO_DATA_ENTREGA] = pedido.DataEntrega.toISOString();
            }

            await this.sp.web.lists.getByTitle(this.listTitle).items.add(itemPayload);
        } catch (e) {
            console.error("Erro ao adicionar pedido:", e);
            throw e;
        }
    }


    public async updatePedido(pedido: IPedido): Promise<void> {
        try {

            let compradorId = 0;
            if (pedido.Comprador) {

                compradorId = await this.getUserIdByEmail(pedido.Comprador);
            }

            const itemPayload: any = {
                Title: pedido.Title,
                Status: pedido.Status,
                Prioridade: pedido.Prioridade,
                Fornecedor: pedido.Fornecedor,
                CompradorId: compradorId > 0 ? compradorId : null,
                Referencia: pedido.Referencia,
                ValorTotal: pedido.ValorTotal,
            };

            if (pedido.DataEntrega) {
                itemPayload[this.CAMPO_DATA_ENTREGA] = pedido.DataEntrega.toISOString();
            }

            await this.sp.web.lists.getByTitle(this.listTitle).items.getById(pedido.ID).update(itemPayload);
        } catch (e) {
            console.error("Erro ao atualizar pedido:", e);
            throw e;
        }
    }


    public async deletePedido(id: number): Promise<void> {
        await this.sp.web.lists.getByTitle(this.listTitle).items.getById(id).delete();
    }
}
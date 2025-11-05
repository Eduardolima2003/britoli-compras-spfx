export interface IPedido {
    Id: number;
    Referencia: string;
    Fornecedor: string;
    Comprador: string;
    Status: string;
    Prioridade: string;
    ValorTotal: number;
    DataCriacao: Date;
    DataEntregaEstimada: Date;
}
export interface IPedido {
    Id: number;
    Referencia: string; // Ex: BR-2025-1001
    Fornecedor: string; // Ex: Tech Solutions Ltda
    ValorTotal: number; // Ex: 15500.00
    DataCriacao: Date;
    DataEntregaEstimada: Date;
    Status: string; // Ex: Recebido, Em Análise, Aprovado
    Comprador: string; // Ex: João Silva
    Prioridade: 'Baixa' | 'Normal' | 'Alta';
}
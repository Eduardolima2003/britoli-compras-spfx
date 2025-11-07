export interface IPedido {
    ID: number;
    Title: string; // Título ou descrição resumida
    Referencia: string; // Referência ou SKU
    Fornecedor: string;
    ValorTotal: number;
    Prioridade: string; // Ex: Baixa, Média, Alta, Urgente
    DataEntrega: Date;
    Status: string; // Ex: Recebido, Em Procuramento, Adjudicado
    Comprador: string; // Email do comprador
    DataCriacao: Date;
}
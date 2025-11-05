export interface IPedido {
    Id: number;
    Referencia: string; // Coluna Referencia (Texto)
    Fornecedor: string; // Coluna Fornecedor (Texto)
    Comprador: string; // Coluna Comprador (Pessoa ou Grupo)
    Status: string; // Coluna Status (Escolha)
    ValorTotal: number; // Coluna ValorTotal (Número/Moeda)
    Prioridade: string; // Coluna Prioridade (Escolha)
    DataCriacao: Date; // Coluna Created (SharePoint padrão)
    DataEntregaEstimada: Date; // Coluna DataEntregaEstimada (Data)
}
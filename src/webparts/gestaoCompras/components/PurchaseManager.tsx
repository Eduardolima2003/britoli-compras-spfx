import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Stack, Text, Separator, Pivot, PivotItem, IStackTokens, FontIcon, Spinner, SpinnerSize, DetailsList, DetailsListLayoutMode, SelectionMode, IColumn, MessageBar, MessageBarType, PrimaryButton } from '@fluentui/react';
import { IPurchaseManagerProps } from './IPurchaseManagerProps';
import { DataService } from '../services/DataService';
import { IPedido } from './IPedidos';
import PedidoDetalhes from './PedidoDetalhes';
import PedidoForm from './PedidoForm'; // Novo Componente Importado

// Enum AJUSTADO: As chaves devem corresponder EXATAMENTE aos valores na coluna Status do SharePoint
enum TabKeys {
    Recebido = 'RECEBIDO',
    EmProcuramento = 'EM PROCURAMENT',
    AValidar = 'A VALIDAR',
    Adjudicado = 'ADJUDICADO',
}

// Definição das colunas para a tabela DetailsList
const columns: IColumn[] = [
    { key: 'column1', name: 'Ref.', fieldName: 'Referencia', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: 'column2', name: 'Fornecedor', fieldName: 'Fornecedor', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column3', name: 'Status', fieldName: 'Status', minWidth: 100, maxWidth: 150, isResizable: true },
    {
        key: 'column4', name: 'Valor', fieldName: 'ValorTotal', minWidth: 100, maxWidth: 150, isResizable: true,
        onRender: (item: IPedido): string => `R$ ${item.ValorTotal.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
    },
    {
        key: 'column5', name: 'Criação', fieldName: 'DataCriacao', minWidth: 100, maxWidth: 150, isResizable: true,
        onRender: (item: IPedido): string => item.DataCriacao.toLocaleDateString()
    },
];

const PurchaseManager: React.FC<IPurchaseManagerProps> = (props) => {

    const [selectedKey, setSelectedKey] = useState<string>(TabKeys.Recebido);
    const [pedidos, setPedidos] = useState<IPedido[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPedido, setSelectedPedido] = useState<IPedido | undefined>(undefined);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

    const dataService = useMemo(() => new DataService(props.context), [props.context]);

    const loadPedidos = async (status: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedPedidos = await dataService.getPedidosByStatus(status);
            setPedidos(fetchedPedidos);
        } catch (e: unknown) {
            console.error("Erro ao carregar pedidos:", e);
            setError(`Não foi possível carregar os pedidos. Verifique o status '${status}' ou os campos.`);
            setPedidos([]);
        } finally {
            setIsLoading(false);
        }
    };

    const reloadCurrentTab = (): void => {
        void loadPedidos(selectedKey);
    };

    useEffect(() => {
        void loadPedidos(selectedKey);
    }, [selectedKey, dataService]);

    const handleItemClick = (item: IPedido): void => {
        setSelectedPedido(item);
    };

    const dismissPanel = (): void => {
        setSelectedPedido(undefined);
    };

    // Funções para abrir/fechar o formulário de novo pedido
    const openForm = (): void => setIsFormOpen(true);
    const dismissForm = (): void => setIsFormOpen(false);


    const stackTokens: IStackTokens = { childrenGap: 20, padding: 20 };

    const renderTabContent = (): JSX.Element => {
        if (error) {
            return (
                <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
                    {error}
                </MessageBar>
            );
        }

        if (isLoading) {
            return <Spinner size={SpinnerSize.large} label="Carregando Pedidos..." />;
        }

        if (pedidos.length === 0) {
            return <Text variant="large">Nenhum pedido encontrado com status &apos;{selectedKey}&apos;</Text>;
        }

        return (
            <DetailsList
                items={pedidos}
                columns={columns}
                selectionMode={SelectionMode.none}
                layoutMode={DetailsListLayoutMode.justified}
                isHeaderVisible={true}
                onItemInvoked={handleItemClick}
            />
        );
    };

    return (
        <Stack tokens={stackTokens} styles={{ root: { backgroundColor: '#f5f5f5', border: '1px solid #ccc' } }}>

            {/* Header: LOGO, TÍTULO e BOTÃO DE AÇÃO */}
            <Stack horizontal verticalAlign="center" horizontalAlign="space-between" tokens={{ childrenGap: 10 }} styles={{ root: { backgroundColor: '#FFC300', padding: 10 } }}>
                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
                    <FontIcon iconName="ShoppingCart" style={{ fontSize: '30px', color: '#333' }} />
                    <Text variant="xxLarge" styles={{ root: { fontWeight: 'bold', color: '#333' } }}>
                        GESTÃO DE COMPRAS
                    </Text>
                </Stack>
                {/* NOVO BOTÃO DE CADASTRO */}
                <PrimaryButton
                    text="Novo Pedido"
                    iconProps={{ iconName: 'Add' }}
                    onClick={openForm}
                />
            </Stack>

            <Separator />

            {/* Abas de Navegação (Pivot) */}
            <Pivot
                selectedKey={selectedKey}
                onLinkClick={(item) => setSelectedKey(item?.props.itemKey || TabKeys.Recebido)}
                styles={{ root: { padding: '0 10px' } }}
            >
                <PivotItem headerText="RECEBIDO" itemKey={TabKeys.Recebido} />
                <PivotItem headerText="EM PROCURAMENT" itemKey={TabKeys.EmProcuramento} />
                <PivotItem headerText="A VALIDAR" itemKey={TabKeys.AValidar} />
                <PivotItem headerText="ADJUDICADO" itemKey={TabKeys.Adjudicado} />
            </Pivot>

            <Separator />

            {/* Conteúdo dinâmico da Aba */}
            <Stack styles={{ root: { padding: '0 10px' } }}>
                {renderTabContent()}
            </Stack>

            {/* Componente: Visualização de Detalhes (Painel lateral) */}
            {selectedPedido && (
                <PedidoDetalhes
                    pedido={selectedPedido}
                    isOpen={!!selectedPedido}
                    onDismiss={dismissPanel}
                />
            )}

            {/* Componente: Formulário de Novo Pedido (Painel lateral) */}
            <PedidoForm
                isOpen={isFormOpen}
                context={props.context}
                onDismiss={dismissForm}
                onSaveSuccess={reloadCurrentTab}
            />

        </Stack>
    );
};

export default PurchaseManager;
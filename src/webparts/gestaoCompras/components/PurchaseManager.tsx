import * as React from 'react';
import {
    Pivot, PivotItem, Spinner, SpinnerSize, MessageBar, MessageBarType,
    DetailsList, IColumn, SelectionMode, DetailsListLayoutMode, Stack,
    Text, PrimaryButton, SearchBox, initializeIcons, FontIcon, IStackTokens,
    getTheme
} from '@fluentui/react';
import { IPurchaseManagerProps } from './IPurchaseManagerProps';
import { DataService } from '../services/DataService';
import { IPedido } from './IPedidos';
import PedidoDetalhes from './PedidoDetalhes';
import PedidoForm from './PedidoForm';

initializeIcons();

// Cores e Ícones baseados na Prioridade
const getPriorityVisuals = (priority: string): { color: string; label: string } => {
    const theme = getTheme();
    switch (priority?.trim().toUpperCase()) {
        case 'URGENTE':
            return { color: '#5f0000ff', label: 'URGENTE' };
        case 'ALTA':
            return { color: theme.palette.orange, label: 'Alta' };
        case 'MÉDIA':
            return { color: '#E8A000', label: 'Média' };
        case 'BAIXA':
            return { color: theme.palette.green, label: 'Baixa' };
        default:
            return { color: theme.palette.neutralSecondary, label: 'N/D' };
    }
};

enum TabKeys {
    Recebido = 'RECEBIDO',
    EmProcurament = 'EM PROCURAMENT',
    AValidar = 'A VALIDAR',
    Adjudicado = 'ADJUDICADO',
    NovoPedido = 'NOVO',
}

const PurchaseManager: React.FC<IPurchaseManagerProps> = (props) => {


    const dataService = React.useMemo(() => new DataService(props.context), [props.context]);

    const [isLoading, setIsLoading] = React.useState(true);
    const [currentTab, setCurrentTab] = React.useState<TabKeys>(TabKeys.Recebido);
    const [pedidos, setPedidos] = React.useState<IPedido[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedPedido, setSelectedPedido] = React.useState<IPedido | null>(null);
    const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);

    const [pedidoToEdit, setPedidoToEdit] = React.useState<IPedido | undefined>(undefined);

    const tabTitles: { [key in TabKeys]: string } = {
        [TabKeys.Recebido]: 'Recebido',
        [TabKeys.EmProcurament]: 'Em Procurament',
        [TabKeys.AValidar]: 'A Validar',
        [TabKeys.Adjudicado]: 'Adjudicado',
        [TabKeys.NovoPedido]: 'Novo Pedido',
    };


    const loadPedidos = React.useCallback(async (status: TabKeys): Promise<void> => {
        if (status === TabKeys.NovoPedido) {
            setPedidos([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const items = await dataService.getPedidosByStatus(status);
            setPedidos(items);
        } catch (e) {
            console.error("Erro ao carregar pedidos:", e);
            setError("Não foi possível carregar os pedidos. Verifique o console para detalhes.");
        } finally {
            setIsLoading(false);
        }
    }, [dataService]);

    React.useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = globalPivotStyles;
        document.body.appendChild(style);

        return () => {
            document.body.removeChild(style);
        };
    }, []);

    React.useEffect(() => {

        void loadPedidos(currentTab);
    }, [currentTab, loadPedidos]);

    const reloadCurrentTab = React.useCallback((): void => {
        setSelectedPedido(null);
        setPedidoToEdit(undefined);
        setIsFormOpen(false);
        void loadPedidos(currentTab);
    }, [currentTab, loadPedidos]);

    const handleEdit = React.useCallback((pedido: IPedido): void => {
        setSelectedPedido(null);
        setPedidoToEdit(pedido);
        setIsFormOpen(true);
    }, []);

    const handleDeletionSuccess = React.useCallback((deletedId: number): void => {
        setSelectedPedido(null);
        setPedidos(prevPedidos => prevPedidos.filter(p => p.ID !== deletedId));
        // CORRIGIDO LINTER: no-void (131,9)
        void loadPedidos(currentTab);
    }, [currentTab, loadPedidos]);

    const columns: IColumn[] = [
        {
            key: 'colPrioridade',
            name: 'Prioridade',
            fieldName: 'Prioridade',
            minWidth: 100,
            maxWidth: 120,
            isResizable: true,
            onRender: (item: IPedido) => {
                const visuals = getPriorityVisuals(item.Prioridade);
                return (
                    <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 5 }}>
                        <div style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: visuals.color,
                            boxShadow: `0 0 4px ${visuals.color}`
                        }} />
                        <Text style={{ color: visuals.color, fontWeight: 'bold' }}>{visuals.label}</Text>
                    </Stack>
                );
            }
        },
        { key: 'colReferencia', name: 'Ref.', fieldName: 'Referencia', minWidth: 100, maxWidth: 150, isResizable: true },
        { key: 'colFornecedor', name: 'Fornecedor', fieldName: 'Fornecedor', minWidth: 150, maxWidth: 250, isResizable: true },
        {
            key: 'colValor', name: 'Valor', fieldName: 'ValorTotal', minWidth: 80, maxWidth: 100, isResizable: true,
            onRender: (item: IPedido): string => `R$ ${item.ValorTotal.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
        },
        {
            key: 'colCriacao', name: 'Criação', fieldName: 'DataCriacao', minWidth: 100, maxWidth: 120, isResizable: true,
            onRender: (item: IPedido): string => item.DataCriacao.toLocaleDateString()
        },
        { key: 'colComprador', name: 'Comprador', fieldName: 'Comprador', minWidth: 100, maxWidth: 150, isResizable: true },
        { key: 'colStatus', name: 'Status', fieldName: 'Status', minWidth: 100, maxWidth: 120, isResizable: true },
    ];

    // Funções para gerenciar o painel de detalhes
    const dismissPanel = (): void => {
        setSelectedPedido(null);
    };


    const handleItemClick = (item: IPedido): void => {
        setSelectedPedido(item);
    };

    // Funções para gerenciar o formulário
    const openForm = (): void => {
        setPedidoToEdit(undefined);
        setIsFormOpen(true);
    };
    const dismissForm = (): void => {
        setPedidoToEdit(undefined);
        setIsFormOpen(false);
    };

    const stackTokens: IStackTokens = { childrenGap: 20, padding: 20 };


    return (
        <Stack tokens={stackTokens} styles={{ root: { backgroundColor: '#f5f5f5', border: '1px solid #ccc' } }}>
            {/* HEADER (GESTAO DE COMPRAS + NOVO PEDIDO) */}
            <Stack horizontal verticalAlign="center" horizontalAlign="space-between" tokens={{ childrenGap: 10 }} styles={{ root: { backgroundColor: '#FFC300', padding: 10 } }}>
                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
                    <FontIcon iconName="ShoppingCart" style={{ fontSize: '30px', color: '#333' }} />
                    <Text variant="xxLarge" styles={{ root: { fontWeight: 'bold', color: '#333' } }}>
                        GESTÃO DE COMPRAS
                    </Text>
                </Stack>
                {/* BOTÃO NOVO PEDIDO: APLICAÇÃO DO ESTILO CUSTOMIZADO */}
                <PrimaryButton
                    text="Novo Pedido"
                    iconProps={{ iconName: 'Add' }}
                    onClick={openForm}
                    styles={{
                        root: {
                            backgroundColor: '#d3a902ff',
                            borderColor: '#d3a902ff',
                            fontWeight: '600',
                            height: '40px',
                            borderRadius: '30px',
                        },
                        rootHovered: {
                            backgroundColor: '#b08f0aff',
                            borderColor: '#b08f0aff',
                        },
                        label: {
                            color: 'white',
                            fontWeight: '600',
                        },
                        icon: {
                            color: 'white',
                        }
                    }}
                />
            </Stack>

            {error && (
                <MessageBar messageBarType={MessageBarType.error} isMultiline>
                    {error}
                </MessageBar>
            )}

            {/* ABAS DE STATUS: APLICAÇÃO DOS ESTILOS CUSTOMIZADOS */}

            <Pivot
                selectedKey={currentTab}
                onLinkClick={(item) => void setCurrentTab(item.props.itemKey as TabKeys)}

            >
                {(Object.keys(TabKeys) as Array<keyof typeof TabKeys>)
                    .filter(key => key !== 'NovoPedido')
                    .map(key => {
                        const statusKey = TabKeys[key];
                        return (
                            <PivotItem
                                headerText={tabTitles[statusKey]}
                                itemKey={statusKey}
                                key={statusKey}
                            />
                        );
                    })}
            </Pivot>

            <Stack styles={{ root: { padding: '0 10px' } }}>
                <SearchBox
                    placeholder="Buscar pedidos..."
                    styles={{ root: { width: 300, marginBottom: 15 } }}
                />

                {/* Conteúdo do DetailsList */}
                {isLoading ? (
                    <Spinner size={SpinnerSize.large} label="Carregando pedidos..." />
                ) : (
                    <DetailsList
                        items={pedidos}
                        columns={columns}
                        setKey="set"
                        layoutMode={DetailsListLayoutMode.justified}
                        selectionMode={SelectionMode.none}
                        onItemInvoked={handleItemClick}
                    />
                )}
            </Stack>

            {/* Componente 1: Visualização de Detalhes (Painel lateral) */}
            {selectedPedido && (
                <PedidoDetalhes
                    pedido={selectedPedido}
                    isOpen={!!selectedPedido}
                    onDismiss={dismissPanel}
                    dataService={dataService}
                    onStatusChangeSuccess={reloadCurrentTab}
                    onEdit={handleEdit}
                    onDelete={handleDeletionSuccess}
                />
            )}

            {/* Componente 2: Formulário de Novo Pedido (Painel lateral) - USADO TAMBÉM PARA EDIÇÃO */}
            <PedidoForm
                isOpen={isFormOpen}
                context={props.context}
                onDismiss={dismissForm}
                onSaveSuccess={reloadCurrentTab}
                pedidoEmEdicao={pedidoToEdit}
            />
        </Stack>
    );
};

export default PurchaseManager;


const globalPivotStyles = `
    /* ESTILOS DA RAIZ DO PIVOT - TIRA A BORDA INFERIOR */
    .ms-Pivot {
        border-bottom: none !important;
        /* Garante que o padding horizontal da raiz seja zero para não esmagar o primeiro item */
        padding-left: 0 !important;
        padding-right: 0 !important;
    }

    /* ESTILOS BASE DA CÁPSULA (APLICADO EM TODAS AS ABAS) */
    .ms-Pivot-link {
        border-radius: 50px !important;
        /* AUMENTO DO ESPAÇAMENTO INTERNO (PADDING) - MAIS AGRESSIVO */
        padding: 6px 20px !important; /* Aumentado de 16px para 20px */
        margin-right: 8px !important;
        font-weight: 600 !important;
        color: #323130 !important;
        background-color: #f9e598 !important; /* AMARELO CLARO (Base Inativa) */
        border: none !important;
        margin-bottom: 0 !important;
    }

    /* ESTILO NO HOVER (APLICADO EM ABAS) */
    .ms-Pivot-link:hover {
        background-color: #fbe487 !important; /* Amarelo para hover */
        border: none !important;
    }

    /* ESTILO ATIVO/SELECIONADO (APLICADO NA ABA CLICADA) */
    .ms-Pivot-link.is-selected {
        background-color: #f5c000 !important; /* AMARELO ESCURO (Ativo) */
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
        border: none !important;
        color: #323130 !important;
    }

    /* REMOÇÃO DAS LINHAS INFERIORES PADRÃO */
    .ms-Pivot-link::after, 
    .ms-Pivot-link.is-selected::after,
    .ms-Pivot-link:before,
    .ms-Pivot-link.is-selected:before {
        content: none !important;
        height: 0 !important;
        border: none !important;
    }
`;
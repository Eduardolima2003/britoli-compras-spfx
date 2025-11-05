import * as React from 'react';
import { IPedido } from './IPedidos';
import { Panel, PanelType, Stack, Text, Separator, DefaultButton, PrimaryButton, IStackTokens, FontIcon } from '@fluentui/react';

// Define as propriedades que o componente de Detalhes receberá
interface IPedidoDetalhesProps {
    pedido: IPedido;
    isOpen: boolean;
    onDismiss: () => void;
}

const itemTokens: IStackTokens = { childrenGap: 10 };

// Função para simular uma notificação sem usar alert()
const showMessage = (message: string): void => {
    console.log(`[ALERTA DE AÇÃO] ${message}`);
};

/**
 * Componente que exibe os detalhes completos de um pedido em um painel lateral.
 */
const PedidoDetalhes: React.FC<IPedidoDetalhesProps> = ({ pedido, isOpen, onDismiss }) => {

    const formatCurrency = (value: number): string => {
        return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    };

    const DetailItem: React.FC<{ label: string, value: string | JSX.Element }> = ({ label, value }) => (
        <Stack horizontal tokens={{ childrenGap: 20 }} verticalAlign="center">
            <Text variant="small" styles={{ root: { fontWeight: 'bold', minWidth: 150 } }}>{label}:</Text>
            {typeof value === 'string' ? <Text variant="medium">{value}</Text> : value}
        </Stack>
    );

    const headerText = `Detalhes do Pedido: ${pedido.Referencia}`;

    return (
        <Panel
            isOpen={isOpen}
            onDismiss={onDismiss}
            headerText={headerText}
            type={PanelType.medium}
            onRenderFooterContent={() => (
                <Stack horizontal tokens={{ childrenGap: 10 }} styles={{ root: { padding: '10px 0' } }}>
                    <PrimaryButton
                        text="Iniciar Processamento"
                        onClick={() => {
                            showMessage(`Pedido ${pedido.Referencia} enviado para processamento.`);
                            onDismiss();
                        }}
                    />
                    <DefaultButton text="Fechar" onClick={onDismiss} />
                </Stack>
            )}
        >
            <Stack tokens={itemTokens} styles={{ root: { padding: '20px 0' } }}>

                {/* Status do Pedido (Destacado) */}
                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
                    <FontIcon iconName="Tag" style={{ fontSize: '20px', color: '#0078D4' }} />
                    <Text variant="xLarge" styles={{ root: { fontWeight: 'bold' } }}>
                        Status Atual: {pedido.Status}
                    </Text>
                </Stack>

                <Separator />

                {/* Seção de Dados Principais */}
                <Text variant="large" styles={{ root: { fontWeight: 'bold', marginTop: 10, marginBottom: 5 } }}>Informações Básicas</Text>
                <DetailItem label="Referência" value={pedido.Referencia} />
                <DetailItem label="Fornecedor" value={pedido.Fornecedor} />
                <DetailItem label="Comprador" value={pedido.Comprador} />
                <DetailItem label="Prioridade" value={pedido.Prioridade} />

                <Separator />

                {/* Seção de Valores e Datas */}
                <Text variant="large" styles={{ root: { fontWeight: 'bold', marginTop: 10, marginBottom: 5 } }}>Datas e Valores</Text>
                <DetailItem label="Valor Total" value={formatCurrency(pedido.ValorTotal)} />
                <DetailItem label="Data de Criação" value={pedido.DataCriacao.toLocaleDateString()} />
                <DetailItem label="Entrega Estimada" value={pedido.DataEntregaEstimada.toLocaleDateString()} />

            </Stack>
        </Panel>
    );
};

export default PedidoDetalhes;
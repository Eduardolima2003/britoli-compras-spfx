import * as React from 'react';
import {
    Panel, PanelType, Text, Stack, PrimaryButton, DefaultButton,
    Separator, MessageBar, MessageBarType, Dropdown, IDropdownOption,
    Icon
} from '@fluentui/react';
import { IPedido } from './IPedidos';
import { DataService } from '../services/DataService';


// Define as propriedades estendidas para o painel de detalhes
interface IPedidoDetalhesProps {
    pedido: IPedido;
    isOpen: boolean;
    onDismiss: () => void;
    dataService: DataService;
    onStatusChangeSuccess: () => void; // Chamado após sucesso no SAVE STATUS
    onEdit: (pedido: IPedido) => void; // Chamado ao clicar em EDITAR
    onDelete: (pedidoId: number) => void; // Chamado após sucesso na EXCLUSÃO
}

// Opções de Status disponíveis para atualização
const statusOptions: IDropdownOption[] = [
    { key: 'RECEBIDO', text: 'Recebido' },
    { key: 'EM PROCURAMENT', text: 'Em Procuramento' },
    { key: 'A VALIDAR', text: 'A Validar' },
    { key: 'ADJUDICADO', text: 'Adjudicado' },
];

const PedidoDetalhes: React.FC<IPedidoDetalhesProps> = ({
    pedido, isOpen, onDismiss, dataService, onStatusChangeSuccess, onEdit, onDelete
}) => {
    const [currentStatus, setCurrentStatus] = React.useState(pedido.Status);
    const [isSavingStatus, setIsSavingStatus] = React.useState(false);
    const [statusError, setStatusError] = React.useState<string | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);

    React.useEffect(() => {
        setCurrentStatus(pedido.Status);
        setStatusError(null);
    }, [pedido]);

    const getPriorityVisuals = (priority: string): { color: string; label: string } => {
        switch (priority?.trim().toUpperCase()) {
            case 'URGENTE': return { color: '#5f0000ff', label: 'URGENTE' };
            case 'ALTA': return { color: '#E8A000', label: 'ALTA' };
            case 'MÉDIA': return { color: '#005a9e', label: 'MÉDIA' };
            case 'BAIXA': return { color: '#107c10', label: 'BAIXA' };
            default: return { color: '#333333', label: 'N/D' };
        }
    };
    const priorityVisuals = getPriorityVisuals(pedido.Prioridade);

    const handleStatusChange = (
        _event: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption
    ): void => {
        if (option) {
            setCurrentStatus(option.key.toString());
        }
    };

    /**
     * Salva o novo Status no SharePoint
     */
    const saveNewStatus = async (): Promise<void> => {
        if (currentStatus === pedido.Status) return;

        setIsSavingStatus(true);
        setStatusError(null);
        try {
            const updatedPedido: IPedido = { ...pedido, Status: currentStatus };
            await dataService.updatePedido(updatedPedido);

            onStatusChangeSuccess();

        } catch (e) {
            console.error("Erro ao salvar novo status:", e);
            setStatusError("Erro ao atualizar o status do pedido. Detalhe: " + e.message);
        } finally {
            setIsSavingStatus(false);
        }
    };

    /**
     * Trata a exclusão do pedido com confirmação.
     */
    const handleDelete = async (): Promise<void> => {
        // 1. CONFIRMAÇÃO
        if (!window.confirm(`Tem certeza que deseja EXCLUIR o pedido: ${pedido.Title} (ID: ${pedido.ID})? Esta ação é irreversível.`)) {
            return;
        }

        setIsDeleting(true);
        setStatusError(null);
        try {
            // 2. EXCLUSÃO
            await dataService.deletePedido(pedido.ID);

            // 3. Sucesso: Notifica o componente pai e fecha o painel
            onDelete(pedido.ID);

        } catch (e) {
            console.error("Erro ao excluir pedido:", e);
            setStatusError("Erro ao excluir o pedido. Tente novamente. Detalhe: " + e.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const dataEntregaFormatada = pedido.DataEntrega ? pedido.DataEntrega.toLocaleDateString() : 'N/D';

    return (
        <Panel
            headerText={`Detalhes: ${pedido.Title}`}
            isOpen={isOpen}
            onDismiss={onDismiss}
            type={PanelType.medium}
            closeButtonAriaLabel="Fechar"
            isFooterAtBottom={true}

            //Botões Editar e Excluir
            onRenderFooterContent={() => (
                <Stack horizontal tokens={{ childrenGap: 10 }} styles={{ root: { padding: '10px 0' } }}>
                    <PrimaryButton
                        onClick={() => onEdit(pedido)} // Função que aciona a EDIÇÃO
                        text="Editar"
                        iconProps={{ iconName: 'Edit' }}
                        disabled={isSavingStatus || isDeleting}
                    />
                    <DefaultButton
                        onClick={handleDelete} // Função que aciona a EXCLUSÃO com confirmação
                        text={isDeleting ? "Excluindo..." : "Excluir"}
                        iconProps={{ iconName: 'Delete' }}
                        disabled={isSavingStatus || isDeleting}
                        styles={{ root: { backgroundColor: '#FDE7E9', color: '#A80000', borderColor: '#A80000' } }}
                    />
                    <DefaultButton onClick={onDismiss} text="Fechar" />
                </Stack>
            )}
        >
            <Stack tokens={{ childrenGap: 15 }}>
                {statusError && (
                    <MessageBar messageBarType={MessageBarType.error}>
                        {statusError}
                    </MessageBar>
                )}

                <Text variant="xLarge" styles={{ root: { fontWeight: 'bold' } }}>
                    {pedido.Title || 'Pedido sem Título'}
                </Text>
                <Text variant="medium">
                    <span style={{ fontWeight: 'bold' }}>Referência:</span> {pedido.Referencia}
                </Text>
                <Text variant="medium">
                    <span style={{ fontWeight: 'bold' }}>Fornecedor:</span> {pedido.Fornecedor}
                </Text>
                <Text variant="medium">
                    <span style={{ fontWeight: 'bold' }}>Comprador:</span> {pedido.Comprador}
                </Text>

                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 5 }}>
                    <Text variant="medium" styles={{ root: { fontWeight: 'bold' } }}>Prioridade:</Text>
                    <Icon iconName="CircleFill" style={{ color: priorityVisuals.color, fontSize: 10 }} />
                    <Text variant="medium" style={{ fontWeight: 'bold', color: priorityVisuals.color }}>{priorityVisuals.label}</Text>
                </Stack>

                <Separator />

                <Text variant="large" styles={{ root: { fontWeight: 'bold' } }}>
                    Detalhes da Compra
                </Text>
                <Text variant="medium">
                    <span style={{ fontWeight: 'bold' }}>Valor Total:</span> R$ {pedido.ValorTotal.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                </Text>
                <Text variant="medium">
                    <span style={{ fontWeight: 'bold' }}>Criado em:</span> {pedido.DataCriacao.toLocaleDateString()}
                </Text>
                <Text variant="medium" style={{ color: dataEntregaFormatada === 'N/D' ? 'red' : 'inherit' }}>
                    <span style={{ fontWeight: 'bold' }}>Entrega Estimada:</span> {dataEntregaFormatada}
                </Text>

                <Separator />

                {/* Gestão de Status */}
                <Text variant="medium" styles={{ root: { fontWeight: 'bold', color: '#005a9e' } }}>
                    Status Atual: {currentStatus}
                </Text>
                <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign="end">
                    <Dropdown
                        label="Alterar Status"
                        selectedKey={currentStatus}
                        onChange={handleStatusChange}
                        options={statusOptions}
                        styles={{ root: { width: 250 } }}
                        disabled={isSavingStatus || isDeleting}
                    />
                    <PrimaryButton
                        onClick={saveNewStatus}
                        text={isSavingStatus ? "Salvando..." : "Salvar Status"}
                        disabled={currentStatus === pedido.Status || isSavingStatus || isDeleting}
                        style={{ height: 32 }}
                    />
                </Stack>

            </Stack>
        </Panel>
    );
};

export default PedidoDetalhes;
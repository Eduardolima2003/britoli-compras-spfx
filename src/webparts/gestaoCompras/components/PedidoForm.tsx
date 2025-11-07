import * as React from 'react';
import {
    Panel, PanelType, PrimaryButton, DefaultButton, TextField,
    DatePicker, Dropdown, IDropdownOption, Stack, MessageBar, MessageBarType
} from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { DataService } from '../services/DataService';
import { IPedido } from './IPedidos';

// Opções do Dropdown de Prioridade
const priorityOptions: IDropdownOption[] = [
    { key: 'BAIXA', text: 'Baixa' },
    { key: 'MÉDIA', text: 'Média' },
    { key: 'ALTA', text: 'Alta' },
    { key: 'URGENTE', text: 'Urgente' },
];

// Define as propriedades estendidas para o formulário
interface IPedidoFormProps {
    isOpen: boolean;
    onDismiss: () => void;
    onSaveSuccess: () => void;
    context: WebPartContext;
    pedidoEmEdicao?: IPedido;
}

const PedidoForm: React.FC<IPedidoFormProps> = ({
    isOpen, onDismiss, onSaveSuccess, context, pedidoEmEdicao
}) => {
    // Inicializa o DataService uma única vez
    const dataService = React.useMemo(() => new DataService(context), [context]);

    // Define o estado inicial do formulário
    const initialFormState = {
        Title: '',
        Referencia: '',
        Fornecedor: '',
        Comprador: '', // Campo de e-mail/texto no formulário
        ValorTotal: 0,
        Prioridade: priorityOptions[0].key.toString(), // Padrão: Baixa
        DataEntrega: undefined as Date | undefined,
        ID: undefined as number | undefined // ID só existe se estiver em Edição
    };

    const [formData, setFormData] = React.useState(initialFormState);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // EFEITO para carregar os dados do pedidoEmEdicao ao abrir o painel em modo de edição
    React.useEffect(() => {
        if (pedidoEmEdicao) {
            setFormData({
                Title: pedidoEmEdicao.Title,
                Referencia: pedidoEmEdicao.Referencia,
                Fornecedor: pedidoEmEdicao.Fornecedor,
                Comprador: pedidoEmEdicao.Comprador,
                ValorTotal: pedidoEmEdicao.ValorTotal,
                Prioridade: pedidoEmEdicao.Prioridade,
                DataEntrega: pedidoEmEdicao.DataEntrega,
                ID: pedidoEmEdicao.ID
            });
        } else {
            // Limpa o formulário para um novo pedido
            setFormData(initialFormState);
        }
    }, [pedidoEmEdicao, isOpen]); // Dispara sempre que o pedidoEmEdicao ou o estado de abertura mudar

    // Verifica se está em modo de edição
    const isEditing = !!pedidoEmEdicao;
    const panelTitle = isEditing ? `Editar Pedido: ${formData.Title}` : 'Cadastrar Novo Pedido';
    const primaryButtonText = isEditing ? 'Atualizar Pedido' : 'Salvar Pedido';


    // Handlers de Mudança de Campo
    const handleChange = React.useCallback((
        event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
        newValue?: string,
        fieldName?: keyof typeof formData
    ): void => {
        if (fieldName && newValue !== undefined) {
            setFormData(prev => ({
                ...prev,
                [fieldName]: newValue
            }));
        }
    }, []);

    const handleDateChange = React.useCallback((date?: Date): void => {
        setFormData(prev => ({
            ...prev,
            DataEntrega: date
        }));
    }, []);

    const handleDropdownChange = React.useCallback((
        _event: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption
    ): void => {
        if (option) {
            setFormData(prev => ({
                ...prev,
                Prioridade: option.key.toString()
            }));
        }
    }, []);

    // Validação Básica
    const isValid = formData.Title && formData.Referencia && formData.Fornecedor && formData.Comprador && formData.DataEntrega && formData.ValorTotal >= 0;

    /**
     * Salva ou Atualiza o pedido
     */
    const handleSave = async (): Promise<void> => {
        if (!isValid) {
            setError("Por favor, preencha todos os campos obrigatórios e verifique se o Valor Total é válido.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Cria o objeto base para a API
            const pedidoApi: IPedido = {
                ID: formData.ID || 0, // 0 se for novo
                Title: formData.Title,
                Referencia: formData.Referencia,
                Fornecedor: formData.Fornecedor,
                Comprador: formData.Comprador,
                ValorTotal: formData.ValorTotal,
                Prioridade: formData.Prioridade,
                DataEntrega: formData.DataEntrega as Date, // Garantido pela validação
                Status: pedidoEmEdicao?.Status || "RECEBIDO", // Mantém o status em edição ou define como RECEBIDO
                DataCriacao: pedidoEmEdicao?.DataCriacao || new Date()
            };

            if (isEditing && formData.ID) {
                // Modo Edição: Chama o método de UPDATE
                await dataService.updatePedido(pedidoApi);
            } else {
                // Modo Criação: Chama o método de CREATE
                await dataService.addPedido(pedidoApi);
            }

            // Sucesso
            onSaveSuccess();

        } catch (e) {
            console.error(isEditing ? "Erro ao atualizar pedido:" : "Erro ao salvar novo pedido:", e);
            setError(`Ocorreu um erro ao ${isEditing ? 'atualizar' : 'salvar'} o pedido. Detalhe: ${e.message || 'Erro desconhecido.'}`);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Panel
            headerText={panelTitle}
            isOpen={isOpen}
            onDismiss={onDismiss}
            type={PanelType.medium}
            closeButtonAriaLabel="Fechar"
            isFooterAtBottom={true}
            onRenderFooterContent={() => (
                <Stack horizontal tokens={{ childrenGap: 10 }} styles={{ root: { padding: '10px 0' } }}>
                    <PrimaryButton
                        onClick={handleSave}
                        text={isLoading ? (isEditing ? "Atualizando..." : "Salvando...") : primaryButtonText}
                        disabled={isLoading || !isValid}
                    />
                    <DefaultButton
                        onClick={onDismiss}
                        text="Cancelar"
                        disabled={isLoading}
                    />
                </Stack>
            )}
        >
            <Stack tokens={{ childrenGap: 15 }}>
                {error && (
                    <MessageBar messageBarType={MessageBarType.error}>
                        {error}
                    </MessageBar>
                )}

                <TextField
                    label="Título do Pedido"
                    required
                    value={formData.Title}
                    onChange={(e, v) => handleChange(e, v, 'Title')}
                />
                <TextField
                    label="Referência/SKU"
                    required
                    value={formData.Referencia}
                    onChange={(e, v) => handleChange(e, v, 'Referencia')}
                />
                <TextField
                    label="Fornecedor"
                    required
                    value={formData.Fornecedor}
                    onChange={(e, v) => handleChange(e, v, 'Fornecedor')}
                />
                <TextField
                    label="Comprador (E-mail)"
                    description="Insira o e-mail completo do comprador registrado no SharePoint."
                    required
                    value={formData.Comprador}
                    onChange={(e, v) => handleChange(e, v, 'Comprador')}
                />

                {/* O input de valor é tratado como string, mas convertido para number */}
                <TextField
                    label="Valor Total (R$)"
                    required
                    value={formData.ValorTotal.toString()}
                    onChange={(e, v) => {
                        const numericValue = v ? parseFloat(v.replace(',', '.')) : 0;
                        setFormData(prev => ({
                            ...prev,
                            ValorTotal: isNaN(numericValue) ? 0 : numericValue
                        }));
                    }}
                    type="number"
                    min="0"
                    step="0.01"
                />

                <Dropdown
                    label="Prioridade"
                    selectedKey={formData.Prioridade}
                    options={priorityOptions}
                    onChange={handleDropdownChange}
                    required
                />

                <DatePicker
                    label="Data de Entrega Desejada"
                    isRequired={true}
                    placeholder="Selecione uma data..."
                    value={formData.DataEntrega}
                    onSelectDate={handleDateChange}
                    formatDate={(date) => date.toLocaleDateString()}
                />

                {/* Se estiver editando, mostre o ID */}
                {isEditing && formData.ID && (
                    <TextField
                        label="ID do Pedido"
                        value={formData.ID.toString()}
                        disabled
                    />
                )}
            </Stack>
        </Panel>
    );
};

export default PedidoForm;
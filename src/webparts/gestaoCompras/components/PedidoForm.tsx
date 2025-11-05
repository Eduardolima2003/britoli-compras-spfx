import * as React from 'react';
import { useState } from 'react';
// Importação de tipos para o evento de clique do Fluent UI
import { MouseEventHandler } from 'react';
import { Panel, PanelType, Stack, TextField, PrimaryButton, DefaultButton, Dropdown, IDropdownOption, DatePicker, Spinner, SpinnerSize, MessageBar, MessageBarType } from '@fluentui/react';
import { DataService } from '../services/DataService';
import { WebPartContext } from '@microsoft/sp-webpart-base';
// import { DayPickerStrings } from './FluentUIStrings'; // Opcional, descomente se usar este arquivo

// Opções de Prioridade (devem ser as mesmas do SharePoint)
const priorityOptions: IDropdownOption[] = [
    { key: 'Alta', text: 'Alta' },
    { key: 'Média', text: 'Média' },
    { key: 'Baixa', text: 'Baixa' },
];

// Estado inicial do formulário
const initialFormState = {
    Title: '',
    Referencia: '',
    Fornecedor: '',
    CompradorEmail: '',
    ValorTotal: 0,
    Prioridade: 'Média',
    DataEntregaEstimada: new Date(),
};

// Propriedades do componente
interface IPedidoFormProps {
    isOpen: boolean;
    context: WebPartContext;
    onDismiss: () => void;
    onSaveSuccess: () => void; // Para recarregar os dados
}

/**
 * Componente do formulário para adicionar um novo pedido.
 */
const PedidoForm: React.FC<IPedidoFormProps> = ({ isOpen, context, onDismiss, onSaveSuccess }) => {

    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dataService = React.useMemo(() => new DataService(context), [context]);

    const handleChange = (field: keyof typeof initialFormState, value: string | Date | number): void => {
        setError(null);

        let finalValue: string | Date | number = value;

        if (field === 'ValorTotal' && typeof value === 'string') {
            // Remove pontos de milhar, substitui vírgula por ponto para converter para float
            finalValue = parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
        }

        setFormData(prev => ({ ...prev, [field]: finalValue }));
    };

    // Função para formatar o valor do MaskedTextField na exibição
    const formatValueTotal = (value: number): string => {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, useGrouping: true });
    };

    /**
     * CORREÇÃO APLICADA AQUI:
     * A função agora aceita um evento de Mouse/React.MouseEvent, que é o que o PrimaryButton do Fluent UI espera.
     * Chamamos event.preventDefault() para evitar que o clique do botão nativo cause navegação.
     */
    const handleSubmit: MouseEventHandler<unknown> = async (event): Promise<void> => {
        // Usa `event.preventDefault()` no evento do botão
        if (event && 'preventDefault' in event) {
            event.preventDefault();
        }

        setError(null);

        // Validação básica
        if (!formData.Title || !formData.Referencia || !formData.Fornecedor || !formData.CompradorEmail || formData.ValorTotal <= 0) {
            setError("Por favor, preencha todos os campos obrigatórios e garanta que o Valor Total seja maior que zero.");
            return;
        }

        setIsSaving(true);

        try {
            await dataService.addNewPedido({
                ...formData,
                Status: 'RECEBIDO', // Novo pedido sempre começa com status RECEBIDO
            });

            // Sucesso
            setFormData(initialFormState);
            onSaveSuccess();
            onDismiss();

        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido ao salvar o pedido.';
            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    // Renderiza o rodapé do painel (botões de Ação)
    const onRenderFooterContent = (): JSX.Element => {
        return (
            <Stack horizontal tokens={{ childrenGap: 10 }} styles={{ root: { padding: '10px 0' } }}>
                <PrimaryButton
                    text={isSaving ? "Salvando..." : "Salvar Pedido"}
                    onClick={handleSubmit}
                    disabled={isSaving}
                />
                <DefaultButton text="Cancelar" onClick={onDismiss} disabled={isSaving} />
            </Stack>
        );
    };

    if (!isOpen) return null;

    return (
        <Panel
            isOpen={isOpen}
            onDismiss={onDismiss}
            headerText="Cadastrar Novo Pedido"
            type={PanelType.large}
            onRenderFooterContent={onRenderFooterContent}
            isFooterAtBottom={true}
        >
            {/* Mensagem de Erro (se houver) */}
            {error && (
                <MessageBar messageBarType={MessageBarType.error} isMultiline={true} dismissButtonAriaLabel="Fechar">
                    {error}
                </MessageBar>
            )}

            {/* Conteúdo do Formulário */}
            {/* Removemos a tag <form> pois o Fluent UI Button não é um submit nativo */}
            <Stack tokens={{ childrenGap: 15 }} style={{ padding: '10px 0' }}>

                <TextField
                    label="Título (Obrigatório)"
                    value={formData.Title}
                    onChange={(_, newValue) => handleChange('Title', newValue || '')}
                    required
                />

                <TextField
                    label="Referência (Obrigatório)"
                    value={formData.Referencia}
                    onChange={(_, newValue) => handleChange('Referencia', newValue || '')}
                    required
                />

                <TextField
                    label="Fornecedor (Obrigatório)"
                    value={formData.Fornecedor}
                    onChange={(_, newValue) => handleChange('Fornecedor', newValue || '')}
                    required
                />

                {/* Campo Comprador (E-mail) */}
                <TextField
                    label="Comprador (E-mail - Obrigatório)"
                    placeholder="ex: usuario@dominio.com"
                    value={formData.CompradorEmail}
                    onChange={(_, newValue) => handleChange('CompradorEmail', newValue || '')}
                    required
                    description="Use o e-mail completo do Comprador. O sistema buscará o ID do usuário."
                />

                {/* Campo de Valor Total formatado */}
                <TextField
                    label="Valor Total (R$)"
                    value={formatValueTotal(formData.ValorTotal)}
                    onChange={(_, newValue) => handleChange('ValorTotal', newValue || '0')}
                    iconProps={{ iconName: 'Money' }}
                    required
                    type="text"
                    inputMode="numeric"
                    description="Insira o valor usando vírgula para decimais."
                />

                <Dropdown
                    label="Prioridade"
                    selectedKey={formData.Prioridade}
                    options={priorityOptions}
                    onChange={(_, option) => handleChange('Prioridade', option?.key as string || 'Média')}
                />

                <DatePicker
                    label="Data de Entrega Estimada"
                    onSelectDate={(date) => handleChange('DataEntregaEstimada', date || new Date())}
                    value={formData.DataEntregaEstimada}
                    placeholder="Selecione uma data..."
                    isRequired={true}
                // dayPickerStrings={DayPickerStrings}
                />

                {isSaving && <Spinner size={SpinnerSize.small} label="Salvando pedido..." />}
            </Stack>
        </Panel>
    );
};

export default PedidoForm;
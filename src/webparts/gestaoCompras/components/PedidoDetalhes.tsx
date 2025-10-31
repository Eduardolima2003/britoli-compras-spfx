import * as React from 'react';
import { Stack, Text, Separator, DefaultButton, TextField, PrimaryButton, IStackTokens, IStackStyles } from '@fluentui/react';
import { IPedido } from './IPedidos';


interface IPedidoDetalhesProps {
    pedido: IPedido;
}

const fieldStackTokens: IStackTokens = { childrenGap: 5 };
const mainStackTokens: IStackTokens = { childrenGap: 20 };
const sectionStyles: IStackStyles = { root: { padding: 0 } };

const LIGHT_GRAY_BACKGROUND = '#d1d1d1ff';

const textFieldBaseStyles = {
    fieldGroup: {
        backgroundColor: LIGHT_GRAY_BACKGROUND,
        borderColor: 'transparent',
    },
    field: {
        color: 'black',
    }
};

// Mapeia o status para a cor
const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Em Análise': return 'orange';
        case 'Aprovado': return 'green';
        case 'Recebido': return '#0078d4';
        default: return 'gray';
    }
};

export const PedidoDetalhes: React.FC<IPedidoDetalhesProps> = ({ pedido }) => {

    if (!pedido) {
        return <Text variant="large">Erro: Dados do pedido indisponíveis.</Text>;
    }

    return (
        <Stack tokens={mainStackTokens} styles={{ root: { padding: 10 } }}>

            {/* Cabeçalho da Seção */}
            <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
                <Text styles={{ root: { fontSize: '15px', fontWeight: 'bold' } }}>
                    Pedido de cotação
                </Text>
                <DefaultButton text="NOVO PEDIDO" styles={{
                    root: {

                        backgroundColor: 'gold',
                        borderColor: 'gold',
                        color: 'black',
                        borderRadius: 15
                    },

                    rootHovered: {
                        backgroundColor: '#FFCC00',
                        borderColor: '#FFCC00',
                        color: 'black'
                    },

                    rootPressed: {
                        backgroundColor: '#FFAA00',
                        borderColor: '#FFAA00',
                        color: 'black'
                    }
                }}
                />
            </Stack>

            <Separator />

            {/* Campos do Formulário */}
            <Stack tokens={fieldStackTokens} styles={sectionStyles}>
                {/* Referência */}
                <Text variant="medium" styles={{ root: { fontWeight: 'bold' } }}>Referência</Text>
                <TextField
                    readOnly
                    value={pedido.Referencia}
                    styles={textFieldBaseStyles}
                />

                {/* Estado (Com cor condicional) */}
                <Text variant="medium" styles={{ root: { fontWeight: 'bold' } }}>Estado</Text>
                <TextField
                    readOnly
                    value={pedido.Status}
                    styles={{
                        fieldGroup: textFieldBaseStyles.fieldGroup,
                        field: {
                            color: getStatusColor(pedido.Status),
                            fontWeight: 'bold'
                        }
                    }}
                />

                {/* Outros Campos */}
                <Text variant="medium" styles={{ root: { fontWeight: 'bold' } }}>Obra</Text>
                <TextField readOnly value="XXXXX" styles={textFieldBaseStyles} />

                <Text variant="medium" styles={{ root: { fontWeight: 'bold' } }}>Assunto</Text>
                <TextField readOnly value="XXXXX" styles={textFieldBaseStyles} />

                <Text variant="medium" styles={{ root: { fontWeight: 'bold' } }}>Data limite compra</Text>
                <TextField readOnly value={"20/10/2025"} styles={textFieldBaseStyles} />

                <Text variant="medium" styles={{ root: { fontWeight: 'bold' } }}>Data limite entrada em obra</Text>
                <TextField readOnly value={"15/12/2025"} styles={textFieldBaseStyles} />

                <Text variant="medium" styles={{ root: { fontWeight: 'bold' } }}>Buyer</Text>
                <TextField readOnly value={pedido.Comprador} styles={textFieldBaseStyles} />

                <Text variant="medium" styles={{ root: { fontWeight: 'bold' } }}>Referência do fornecedor</Text>
                <TextField readOnly value="XXXXX" styles={textFieldBaseStyles} />

                <Text variant="medium" styles={{ root: { fontWeight: 'bold' } }}>Requisitante</Text>
                <TextField readOnly value="XXXXX" styles={textFieldBaseStyles} />

                <Text variant="medium" styles={{ root: { fontWeight: 'bold' } }}>Tipo</Text>
                <TextField readOnly value="XXXXX" styles={textFieldBaseStyles} />

                <Text variant="medium" styles={{ root: { fontWeight: 'bold' } }}>Tipo de encomenda</Text>
                <TextField readOnly value="XXXXX" styles={textFieldBaseStyles} />

                <Text variant="medium" styles={{ root: { fontWeight: 'bold' } }}>Nome do fornecedor</Text>
                <TextField readOnly value={pedido.Fornecedor} styles={textFieldBaseStyles} />

                <Text variant="medium" styles={{ root: { fontWeight: 'bold' } }}>Preço seco</Text>
                <TextField readOnly value="XXXXX" styles={textFieldBaseStyles} />

            </Stack>

            <Separator />

            {/* Botão GRVAR */}
            <PrimaryButton
                text="GRAVAR"
                styles={{
                    root: {
                        backgroundColor: 'gold',
                        borderColor: 'gold',
                        color: 'black',
                        borderRadius: 15
                    },

                    rootHovered: {
                        backgroundColor: '#FFCC00',
                        borderColor: '#FFCC00',
                        color: 'black'
                    },

                    rootPressed: {
                        backgroundColor: '#FFAA00',
                        borderColor: '#FFAA00',
                        color: 'black'
                    }
                }}
            />

        </Stack>
    );
};

export default PedidoDetalhes;
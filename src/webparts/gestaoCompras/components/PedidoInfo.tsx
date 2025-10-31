import * as React from 'react';
import { Stack, Text, Separator, DefaultButton, IStackTokens, IStackStyles } from '@fluentui/react';
import { IPedido } from './IPedidos'; 


interface IPedidoInfoProps {
    pedido: IPedido;
}

const infoStackTokens: IStackTokens = { childrenGap: 10 };
const sectionStyles: IStackStyles = { root: { padding: 10, border: '1px solid #ccc', borderRadius: 4, backgroundColor: '#f8f8f8' } };

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR');

export const PedidoInfo: React.FC<IPedidoInfoProps> = ({ pedido }) => {

    if (!pedido) {
        return <Text variant="large">Nenhum pedido encontrado.</Text>;
    }

    return (
        <Stack tokens={{ childrenGap: 20 }}>
            <Text variant="xxLarge" styles={{ root: { fontWeight: 'bold' } }}>
                Detalhes do Pedido <span style={{ color: '#0078d4' }}>#{pedido.Referencia}</span>
            </Text>
            
            <Stack horizontal styles={sectionStyles} tokens={infoStackTokens}>
                <Stack.Item grow={1}>
                    <Text variant="mediumPlus" styles={{ root: { fontWeight: 'bold' } }}>
                        Status: <span style={{ color: 'orange' }}>{pedido.Status}</span>
                    </Text>
                </Stack.Item>
                <Stack.Item grow={1}>
                    <Text variant="mediumPlus" styles={{ root: { fontWeight: 'bold' } }}>
                        Prioridade: <span style={{ color: pedido.Prioridade === 'Alta' ? 'red' : 'green' }}>{pedido.Prioridade}</span>
                    </Text>
                </Stack.Item>
            </Stack>

            <Separator />
            
            <Stack tokens={infoStackTokens} styles={sectionStyles}>
                <Text variant="large" styles={{ root: { fontWeight: '600' } }}>Informações Financeiras</Text>
                <Text>
                    **Valor Total:** {currencyFormatter.format(pedido.ValorTotal)}
                </Text>
                <Text>
                    **Fornecedor:** {pedido.Fornecedor}
                </Text>
                <Text>
                    **Comprador:** {pedido.Comprador}
                </Text>
            </Stack>
            
            <Stack tokens={infoStackTokens} styles={sectionStyles}>
                <Text variant="large" styles={{ root: { fontWeight: '600' } }}>Datas e Prazos</Text>
                <Text>
                    **Data de Criação:** {dateFormatter.format(pedido.DataCriacao)}
                </Text>
                <Text>
                    **Entrega Estimada:** {dateFormatter.format(pedido.DataEntregaEstimada)}
                </Text>
            </Stack>

            <DefaultButton text="Ver Detalhes e Itens do Pedido" iconProps={{ iconName: 'QuickView' }} />
        </Stack>
    );
};

export default PedidoInfo;
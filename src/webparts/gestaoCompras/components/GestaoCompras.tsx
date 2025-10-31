import * as React from 'react';
import { Stack, IStackStyles, IStackTokens } from '@fluentui/react';
import styles from './GestaoCompras.module.scss';
import type { IGestaoComprasProps } from './IGestaoComprasProps';

// Importe os componentes de layout
import Header from './Header';
import StatusNavigation from './StatusNavigation';
import PedidoInfo from './PedidoInfo';
import ChatApp from './ChatApp';
import PedidoDetalhes from './PedidoDetalhes';

// --- Estilos para o Container Principal ---
const mainStackStyles: IStackStyles = {
    root: {
        padding: 20,
        backgroundColor: '#fff', // Fundo branco
        maxWidth: '1200px',
        margin: '0 auto',
    },
};

// Tokens para espaçamento entre as colunas
const mainStackTokens: IStackTokens = { childrenGap: 20 };

// --- Componente Funcional Principal ---
export const GestaoCompras: React.FC<IGestaoComprasProps> = (props) => {


    return (
        <div className={styles.gestaoCompras}>
            {/* 1. CABEÇALHO (Topo Amarelo) */}
            <Header />

            {/* 2. NAVEGAÇÃO DE STATUS (Botões Recebido, Em Procurement, etc.) */}
            <StatusNavigation />

            {/* 3. CONTEÚDO PRINCIPAL (Duas Colunas: Pedido e Chat) */}
            <Stack horizontal styles={mainStackStyles} tokens={mainStackTokens}>
                {/* Coluna da Esquerda: PedidoDetalhes (O NOVO FORMULÁRIO) */}
                <Stack.Item grow={1} >
                    <PedidoDetalhes pedido={props.pedido} />
                </Stack.Item>

                {/* Coluna da Direita (Chat/Mensagens) */}
                <Stack.Item grow={1} >
                    <ChatApp
                        userDisplayName={props.userDisplayName}

                        context={props.context}
                    />
                </Stack.Item>
            </Stack>
        </div>
    );
};

export default GestaoCompras;
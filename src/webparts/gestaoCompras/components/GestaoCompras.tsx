import * as React from 'react';
import { Stack, IStackStyles, IStackTokens } from '@fluentui/react';

// Importe os estilos SCSS gerados pelo SPFx
import styles from './GestaoCompras.module.scss';

// Importe as interfaces de propriedades (que ainda estão no seu IGestaoComprasProps)
import type { IGestaoComprasProps } from './IGestaoComprasProps'; 

// Importe os componentes de layout (Você precisa ter criado os arquivos .tsx deles)
import Header from './Header';
import StatusNavigation from './StatusNavigation';
import PedidoInfo from './PedidoInfo'; 
import ChatApp from './ChatApp';       

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

// --- Componente Funcional Principal (Substitui a Classe) ---
export const GestaoCompras: React.FC<IGestaoComprasProps> = (props) => {
    // Agora o componente recebe as props diretamente, sem usar `this.props`

    return (
        <div className={styles.gestaoCompras}>
            {/* 1. CABEÇALHO (Topo Amarelo) */}
            <Header />

            {/* 2. NAVEGAÇÃO DE STATUS (Botões Recebido, Em Procurement, etc.) */}
            <StatusNavigation />

            {/* 3. CONTEÚDO PRINCIPAL (Duas Colunas: Pedido e Chat) */}
            <Stack horizontal styles={mainStackStyles} tokens={mainStackTokens}>
                {/* Coluna da Esquerda (Informações do Pedido) */}
                <Stack.Item grow={1} >
                    {/* Neste componente vamos preencher os campos de Referência, Estado, etc. */}
                    <PedidoInfo /> 
                </Stack.Item>

                {/* Coluna da Direita (Chat/Mensagens) */}
                <Stack.Item grow={1} >
                    {/* Este será o componente de chat */}
                    <ChatApp /> 
                </Stack.Item>
            </Stack>
        </div>
    );
};

export default GestaoCompras;
import * as React from 'react';
import { Stack, PrimaryButton, DefaultButton, IStackTokens, IButtonStyles } from '@fluentui/react';

// Tipos de status
type Status = 'RECEBIDO' | 'EM PROCURAMENT' | 'A VALIDAR' | 'ADJUDICADO';

const statuses: Status[] = ['RECEBIDO', 'EM PROCURAMENT', 'A VALIDAR', 'ADJUDICADO'];

// Tokens para espaçamento
const tokens: IStackTokens = { childrenGap: 10 };

// Estilo básico do botão desativado (Default)
const defaultButtonStyles: IButtonStyles = {
  root: {
    backgroundColor: '#F3F2F1', // Cinza claro
    borderColor: '#F3F2F1',
    color: '#323130',
    fontWeight: 'normal',
  },
  rootHovered: {
    backgroundColor: '#EAEAEA',
  },
};

// Estilo do botão ativo (Primary)
const primaryButtonStyles: IButtonStyles = {
    root: {
        backgroundColor: '#FFC72C', // Amarelo
        borderColor: '#FFC72C',
        color: '#323130', // Texto escuro
        fontWeight: 'bold',
    },
    rootHovered: {
        backgroundColor: '#FFD75E',
    },
};

const StatusNavigation: React.FC = () => {
  // Estado para armazenar o status ativo (RECEBIDO é o ativo na imagem)
  const [activeStatus, setActiveStatus] = React.useState<Status>('RECEBIDO');

  return (
    <Stack horizontal tokens={tokens} styles={{ root: { padding: '0 20px 20px', alignItems: 'center' } }}>
      {statuses.map(status => {
        const isActive = status === activeStatus;
        const ButtonComponent = isActive ? PrimaryButton : DefaultButton;
        const stylesToUse = isActive ? primaryButtonStyles : defaultButtonStyles;

        return (
          <ButtonComponent 
            key={status}
            text={status}
            onClick={() => setActiveStatus(status)}
            styles={stylesToUse}
          />
        );
      })}
    </Stack>
  );
};

export default StatusNavigation;
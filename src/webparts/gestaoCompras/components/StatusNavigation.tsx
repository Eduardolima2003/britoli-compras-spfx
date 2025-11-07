import * as React from 'react';
import { Stack, PrimaryButton, DefaultButton, IStackTokens, IButtonStyles } from '@fluentui/react';


type Status = 'RECEBIDO' | 'EM PROCURAMENT' | 'A VALIDAR' | 'ADJUDICADO';

const statuses: Status[] = ['RECEBIDO', 'EM PROCURAMENT', 'A VALIDAR', 'ADJUDICADO'];


const tokens: IStackTokens = { childrenGap: 10 };


const defaultButtonStyles: IButtonStyles = {
  root: {
    backgroundColor: '#ecdd84ff',
    borderColor: '#ecdd84ff',
    color: '#323130',
    fontWeight: 'normal',
    borderRadius: 15
  },
  rootHovered: {
    backgroundColor: '#FFC72C',
  },
};

const primaryButtonStyles: IButtonStyles = {
  root: {
    backgroundColor: '#FFC72C',
    borderColor: 'transparent',
    color: '#323130',
    fontWeight: 'bold',
    borderRadius: 15
  },
  rootHovered: {
    backgroundColor: '#FFD75E',
  },

  rootPressed: {
    backgroundColor: '#FFAA00',
    borderColor: '#FFAA00',
    color: 'black'
  }
};

const StatusNavigation: React.FC = () => {

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
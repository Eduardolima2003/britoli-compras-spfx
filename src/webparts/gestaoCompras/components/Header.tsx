import * as React from 'react';
import { Stack, Text, IStackStyles } from '@fluentui/react';

const headerStyles: IStackStyles = {
  root: {
    backgroundColor: '#FFC72C',
    padding: '10px 20px',
    marginBottom: 20,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
};

const Header: React.FC = () => {
  return (
    <Stack horizontal tokens={{ childrenGap: 15 }} styles={headerStyles}>
      {/* Aqui você colocaria um ícone (ex: um Circle) ou imagem */}
      <Text variant="xxLarge" styles={{ root: { fontWeight: 'bold', color: '#323130' } }}>
        <span role="img" aria-label="carrinho">🛒</span>
        {' '}
        GESTÃO DE COMPRAS
      </Text>
      {/* O carrinho no canto direito pode ser adicionado aqui com Stack.Item grow */}
    </Stack>
  );
};

export default Header;
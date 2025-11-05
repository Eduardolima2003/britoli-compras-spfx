import * as React from 'react';

// CORREÇÃO: Remoção de imports não utilizados que causavam warnings, como 'PedidoInfo' e 'PurchaseManager'
import { escape } from '@microsoft/sp-lodash-subset';
import styles from './GestaoCompras.module.scss';
import { IGestaoComprasProps } from './IGestaoComprasProps';

export default class GestaoCompras extends React.Component<IGestaoComprasProps, {}> {
  public render(): React.ReactElement<IGestaoComprasProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    return (
      <section className={`${styles.gestaoCompras} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.welcome}>
          <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />
          <h2>Bem-vindo, {escape(userDisplayName)}!</h2>
          <div>{environmentMessage}</div>
          <div>Propriedade: <strong>{escape(description)}</strong></div>
        </div>
      </section>
    );
  }
}
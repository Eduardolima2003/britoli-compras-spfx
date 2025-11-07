import * as React from 'react';
import { escape } from '@microsoft/sp-lodash-subset';

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
      <section>
        <div>



          <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} />

        </div>
        <h1>Bem-vindo ao GestaoCompras Web Part!</h1>
      </section>
    );
  }
}
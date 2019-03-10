import electron from 'electron';
import React from 'react';
import App, {Container} from 'next/app';
import * as Sentry from '@sentry/browser';

const SENTRY_PUBLIC_DSN = 'https://2dffdbd619f34418817f4db3309299ce@sentry.io/255536';

const remote = electron.remote || false;

export default class Kap extends App {
  state = {isDark: false}

  constructor(...args) {
    super(...args);

    if (remote) {
      // TODO: When we disable SSR, this can be a normal import
      const {is, darkMode} = remote.require('electron-util');
      const settings = remote.require('./common/settings');

      if (!is.development && settings.get('allowAnalytics')) {
        Sentry.init({dsn: SENTRY_PUBLIC_DSN});
      }

      this.darkMode = darkMode;
    }
  }

  componentDidMount() {
    this.setState({isDark: this.darkMode.isEnabled});
    this.darkMode.onChange(() => {
      this.setState({isDark: this.darkMode.isEnabled});
    });
  }

  componentDidCatch(error, errorInfo) {
    Sentry.configureScope(scope => {
      for (const [key, value] of Object.entries(errorInfo)) {
        scope.setExtra(key, value);
      }
    });

    Sentry.captureException(error);

    // This is needed to render errors correctly in development / production
    super.componentDidCatch(error, errorInfo);
  }

  render() {
    const {Component, pageProps} = this.props;
    const {isDark} = this.state;
    return (
      <Container>
        <div className={isDark ? 'dark' : undefined}>
          <Component {...pageProps}/>
          <style jsx global>{`
            :root {
              --kap-blue: #007aff;
              --kap-blue-dark: #006be0;
              --kap-blue-light: #3287ff;
              --red: #ff3b30;
              --black: #000000;
              --dust: #606060;
              --storm: #808080;
              --cloud: #dddddd;
              --smoke: #f1f1f1;
              --white: #ffffff;

              --window-background-color: var(--white);

              --window-header-background: linear-gradient(-180deg, #f9f9f9 0%, #f1f1f1 100%);
              --window-header-box-shadow: 0 1px 0 0 #ddd, inset 0 1px 0 0 #fff;

              --title-color: var(--black);
              --subtitle-color: var(--dust);
              --link-color: var(--kap-blue);

              --row-divider-color: #f1f1f1;
              --input-background-color: var(--white);
              --input-border-color: var(--cloud);

              --icon-focus-background-color: var(--smoke);
              --icon-color: var(--storm);
            }

            .dark {
              --window-background-color: rgba(0, 0, 0, 0.3);

              --window-header-background: linear-gradient(-180deg, rgba(68, 68, 68, 0.8) 0%, rgba(51, 51, 51, 0.8) 100%);
              --window-header-box-shadow: inset 0 -1px 0 0 rgba(96, 96, 96, 0.2), 0 1px 0 0 #000000;

              --title-color: var(--white);
              --subtitle-color: #ffffff99;

              --row-divider-color: rgba(0, 0, 0, 0.2);
              --input-background-color: rgba(255, 255, 255, 0.1);
              --input-border-color: transparent;

              --icon-focus-background-color: rgba(255, 255, 255, 0.1);
            }
          `}</style>
        </div>
      </Container>
    );
  }
}

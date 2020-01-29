import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Route, Redirect, Switch } from 'react-router-dom';
import {
  VerticalNav,
  VerticalNavItem,
  VerticalNavSecondaryItem,
  VerticalNavMasthead,
  VerticalNavBrand
} from 'patternfly-react';
import { routes } from './routes';
import leappDashboardLogo from './img/leapp-dashboard-logo.svg';
import './App.css';
import DiscoverProvider from './components/DiscoverProvider';

class App extends React.Component {
  constructor() {
    super();

    this.menu = routes();
  }
  handleNavClick = (event: Event) => {
    event.preventDefault();
    const target = (event.currentTarget: any);
    const { history } = this.props;
    if (target.getAttribute) {
      const href = target.getAttribute('href');
      history.push(href);
    }
  };

  renderContent = () => {
    const allRoutes = [];
    this.menu.map((item, index) => {
      allRoutes.push(
        <Route key={index} exact path={item.to} component={item.component} />
      );
      if (item.subItems) {
        item.subItems.map((secondaryItem, subIndex) =>
          allRoutes.push(
            <Route
              key={subIndex}
              exact
              path={secondaryItem.to}
              component={secondaryItem.component}
            />
          )
        );
      }
      return allRoutes;
    });

    return (
      <DiscoverProvider>
        <Switch>
          {allRoutes}
          <Redirect from="*" to="/" key="default-route" />
        </Switch>
      </DiscoverProvider>
    );
  };

  navigateTo = path => {
    const { history } = this.props;
    history.push(path);
  };

  render() {
    const { location } = this.props;
    const vertNavItems = this.menu.map(item => {
      const active = location.pathname === item.to;
      const subItemActive =
        item.subItems &&
        item.subItems.some(item => location.pathname === item.to);
      return (
        <VerticalNavItem
          key={item.to}
          title={item.title}
          iconClass={item.iconClass}
          active={active || subItemActive}
          onClick={() => {
            if (item.to !== location.pathname) {
              this.navigateTo(item.to);
            }
          }}
        >
          {item.subItems &&
            item.subItems.map(secondaryItem => (
              <VerticalNavSecondaryItem
                key={secondaryItem.to}
                title={secondaryItem.title}
                iconClass={secondaryItem.iconClass}
                active={secondaryItem.to === location.pathname}
                onClick={() => this.navigateTo(secondaryItem.to)}
              />
            ))}
        </VerticalNavItem>
      );
    });

    return (
      <React.Fragment>
        <VerticalNav persistentSecondary={false}>
          <VerticalNavMasthead>
            <VerticalNavBrand iconImg={leappDashboardLogo} />
          </VerticalNavMasthead>
          {vertNavItems}
        </VerticalNav>
        {this.renderContent()}
      </React.Fragment>
    );
  }
}

App.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default withRouter(App);

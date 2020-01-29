import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Grid,
  ListView,
  Toolbar,
  Filter,
  TypeAheadSelect
} from 'patternfly-react';
import DiscoverContext from '../DiscoverContext';

// import { EmptyStateComponent } from '../components/EmptyStateComponent';
import FormattedDocstring from '../components/FormattedDocstring';

class ActorsPage extends Component {
  static propTypes = {
    discover: PropTypes.array.isRequired
  };
  state = {
    currentFilterType: 'Name',
    currentFilterValue: '',
    activeFilters: []
  };

  toggleExpand = (item, expandProp) => {
    if (expandProp === item.expandType) {
      item.expanded = !item.expanded;
    } else {
      item.expanded = true;
      item.expandType = expandProp;
    }
    this.setState({ actors: this.state.actors });
  };

  closeExpand(item) {
    item.expanded = false;
    this.setState({ actors: this.state.actors });
  }

  renderDescription(item) {
    return (
      <ListView.InfoItem key="description">
        <ListView.Expand
          expanded={item.expanded && item.expandType === 'description'}
          toggleExpanded={() => {
            this.toggleExpand(item, 'description');
          }}
        >
          <span className="fa fa-info" />
          <strong>Description</strong>
        </ListView.Expand>
      </ListView.InfoItem>
    );
  }

  renderMessages(item) {
    return (
      <ListView.InfoItem key="messages">
        <ListView.Expand
          expanded={item.expanded && item.expandType === 'messages'}
          toggleExpanded={() => {
            this.toggleExpand(item, 'messages');
          }}
        >
          <span className="fa fa-comments" />
          <strong>Messages</strong>
        </ListView.Expand>
      </ListView.InfoItem>
    );
  }

  renderAdditionalInfoExpandItems(item) {
    return (
      <React.Fragment key="extra">
        {this.renderDescription(item)}
        {this.renderMessages(item)}
      </React.Fragment>
    );
  }

  isFiltered = item => {
    const { activeFilters } = this.state;
    if (!activeFilters.length) {
      return false;
    }
    return activeFilters.some(filter => {
      const lowerCurrentFilterValue = filter.value.toLowerCase();
      switch (filter.type) {
        case 'Tag':
          return !item.tags.some(e =>
            e.toLowerCase().includes(lowerCurrentFilterValue)
          );
        case 'Consumes':
          return !item.consumes.some(e =>
            e.toLowerCase().includes(lowerCurrentFilterValue)
          );
        case 'Produces':
          return !item.produces.some(e =>
            e.toLowerCase().includes(lowerCurrentFilterValue)
          );
        case 'Model':
          return !(
            item.produces.some(e =>
              e.toLowerCase().includes(lowerCurrentFilterValue)
            ) ||
            item.consumes.some(e =>
              e.toLowerCase().includes(lowerCurrentFilterValue)
            )
          );
        case 'Name':
          return !(
            item.name.toLowerCase().includes(lowerCurrentFilterValue) ||
            item.class_name.toLowerCase().includes(lowerCurrentFilterValue)
          );
        default:
          break;
      }
      return true;
    });
  };

  renderItem = (item, index) => {
    if (this.isFiltered(item)) {
      return <React.Fragment key={index} />;
    }
    function renderMessageExpand() {
      return (
        <Grid.Row>
          <Grid.Col sm={6}>
            <strong>Consumes</strong>
            <ul>
              {item.consumes.map(e => (
                <li key={`consumed-${e}`}>{e}</li>
              ))}
            </ul>
          </Grid.Col>
          <Grid.Col sm={6}>
            <strong>Produces</strong>
            <ul>
              {item.produces.map(e => (
                <li key={`produced-${e}`}>{e}</li>
              ))}
            </ul>
          </Grid.Col>
        </Grid.Row>
      );
    }

    const expandText = {
      description: () => <FormattedDocstring text={item.description} />,
      messages: renderMessageExpand
    }[item.expandType || 'description'];

    function renderActions() {
      return <div />;
    }

    return (
      <ListView.Item
        key={index}
        actions={renderActions()}
        leftContent={<ListView.Icon name="star" />}
        additionalInfo={[this.renderAdditionalInfoExpandItems(item)]}
        heading={item.class_name}
        // description={item.description}
        stacked
        compoundExpand
        compoundExpanded={item.expanded}
        onCloseCompoundExpand={() => this.closeExpand(item)}
      >
        <Grid.Row>
          <Grid.Col sm={11}>{expandText()}</Grid.Col>
        </Grid.Row>
      </ListView.Item>
    );
  };

  getOptions = actors => {
    const { currentFilterType } = this.state;
    switch (currentFilterType) {
      case 'Name':
        return [...new Set(actors.map(e => e.class_name).flat())].sort();
      case 'Tag':
        return [...new Set(actors.map(e => e.tags).flat())].sort();
      case 'Produces':
        return [...new Set(actors.map(e => e.produces).flat())].sort();
      case 'Consumes':
        return [...new Set(actors.map(e => e.consumes).flat())].sort();
      case 'Model':
        return [
          ...new Set(actors.map(e => e.consumes.concat(e.produces)).flat())
        ].sort();
      default:
        break;
    }
    return [];
  };

  addFilter = (filterType, filterValue) => {
    this.setState({
      activeFilters: [
        ...this.state.activeFilters,
        {
          type: filterType,
          value: filterValue,
          text: `${filterType}: ${filterValue}`
        }
      ]
    });
  };

  removeFilter = current => {
    const { activeFilters } = this.state;
    const filters = activeFilters.filter(e => current !== e);
    this.setState({ activeFilters: filters });
  };

  clearFilters = () => {
    this.setState({
      activeFilters: []
    });
  };

  onTypeAheadChanged = e => {
    const { currentFilterType } = this.state;
    let value = '';
    // if (e.length) value = e[0].label;
    if (e.length) {
      if (typeof e[0] === 'string') {
        // eslint-disable-next-line prefer-destructuring
        value = e[0];
      } else {
        value = e[0].label;
      }
      this.addFilter(currentFilterType, value);
      this.setState({ currentFilterValue: '' });
      return true;
    }
    return false;
  };

  render() {
    const actors = this.props.discover.map(repo => repo.actors).flat();

    const { activeFilters, currentFilterType, currentFilterValue } = this.state;
    return (
      <Grid fluid className="container-pf-nav-pf-vertical">
        <Toolbar>
          <Filter>
            <Filter.TypeSelector
              filterTypes={['Name', 'Tag', 'Model', 'Produces', 'Consumes']}
              currentFilterType={currentFilterType}
              onFilterTypeSelected={next => {
                this.setState({ currentFilterType: next });
              }}
            />
            <TypeAheadSelect
              options={this.getOptions(actors)}
              type={currentFilterType}
              allowNew
              clearButton
              selected={[currentFilterValue]}
              placeholder={currentFilterType}
              onChange={this.onTypeAheadChanged}
            />
          </Filter>
          {activeFilters &&
            activeFilters.length > 0 && (
              <Toolbar.Results>
                <Filter.ActiveLabel>Active Filters:</Filter.ActiveLabel>
                <Filter.List>
                  {activeFilters.map((item, index) => (
                    <Filter.Item
                      key={index}
                      onRemove={this.removeFilter}
                      filterData={item}
                    >
                      {item.text}
                    </Filter.Item>
                  ))}
                </Filter.List>
                <Button
                  bsStyle="link"
                  onClick={e => {
                    e.preventDefault();
                    this.clearFilters();
                  }}
                >
                  Clear All Filters
                </Button>
              </Toolbar.Results>
            )}{' '}
        </Toolbar>
        <ListView>{actors.map(this.renderItem.bind(this))}</ListView>
      </Grid>
    );
  }
}

function ActorsPageWithContext() {
  return (
    <DiscoverContext.Consumer>
      {context => <ActorsPage discover={context} />}
    </DiscoverContext.Consumer>
  );
}

export default ActorsPageWithContext;

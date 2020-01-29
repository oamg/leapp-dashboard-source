import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Grid,
  ListView,
  Toolbar,
  Filter,
  TypeAheadSelect,
  Form
} from 'patternfly-react';
import DiscoverContext from '../DiscoverContext';
// import { EmptyStateComponent } from '../components/EmptyStateComponent';

class ModelsPage extends Component {
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
    this.setState({ models: this.state.models });
  };

  closeExpand(item) {
    item.expanded = false;
    this.setState({ models: this.state.models });
  }

  renderDescription(item) {
    return (
      <ListView.InfoItem key="details">
        <ListView.Expand
          expanded={item.expanded && item.expandType === 'details'}
          toggleExpanded={() => {
            this.toggleExpand(item, 'details');
          }}
        >
          <span className="fa fa-info" />
          <strong>Details</strong>
        </ListView.Expand>
      </ListView.InfoItem>
    );
  }

  renderAdditionalInfoExpandItems(item) {
    return (
      <React.Fragment key="extra">
        {this.renderDescription(item)}
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
        case 'Message Only':
          return !(item.actors.length > 0 && filter.value === 'Yes');
        case 'Topic':
          if (item.topic) {
            return !item.topic.toLowerCase().includes(lowerCurrentFilterValue);
          }
          break;
        case 'Name':
          return !item.class_name
            .toLowerCase()
            .includes(lowerCurrentFilterValue);
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
          <Grid.Col sm={11}>
            <Grid.Row>
              <Grid.Col sm={6}>
                <strong>Consumed by</strong>
                <ul>
                  {item.actors.map(actor =>
                    actor.consumes
                      .filter(e => item.class_name === e)
                      .map(e => (
                        <li key={`produced-${actor.class_name}-${e}`}>
                          {actor.class_name}
                        </li>
                      ))
                  )}
                </ul>
              </Grid.Col>
              <Grid.Col sm={6}>
                <strong>Produced by</strong>
                <ul>
                  {item.actors.map(actor =>
                    actor.produces
                      .filter(e => item.class_name === e)
                      .map(e => (
                        <li key={`produced-${actor.class_name}-${e}`}>
                          {actor.class_name}
                        </li>
                      ))
                  )}
                </ul>
              </Grid.Col>
            </Grid.Row>
          </Grid.Col>
        </Grid.Row>
      </ListView.Item>
    );
  };

  getOptions = models => {
    const { currentFilterType } = this.state;
    switch (currentFilterType) {
      case 'Name':
        return [...new Set(models.map(e => e.class_name).flat())].sort();
      case 'Topic':
        return [...new Set(models.map(e => e.topic))].filter(e => !!e).sort();
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

  removeFilterMessageOnly = then => {
    const { activeFilters } = this.state;
    const filters = activeFilters.filter(e => e.type !== 'Message Only');
    return this.setState({ activeFilters: filters }, then);
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

  conditionalFilter = models => {
    const { currentFilterType, currentFilterValue, activeFilters } = this.state;
    if (currentFilterType === 'Message Only') {
      return (
        <Form.FormGroup>
          <Form.Checkbox
            checked={
              activeFilters.findIndex(e => e.type === currentFilterType) !== -1
            }
            onChange={e => {
              const { checked } = e.target;
              this.removeFilterMessageOnly(() => {
                if (checked) {
                  this.addFilter(currentFilterType, checked ? 'Yes' : 'No');
                }
              });
            }}
          >
            Messages Only
          </Form.Checkbox>
        </Form.FormGroup>
      );
    }
    return (
      <TypeAheadSelect
        options={this.getOptions(models)}
        type={currentFilterType}
        allowNew
        clearButton
        selected={[currentFilterValue]}
        placeholder={currentFilterType}
        onChange={this.onTypeAheadChanged}
      />
    );
  };

  renderToolbar = models => {
    const { activeFilters, currentFilterType } = this.state;
    return (
      <Toolbar>
        <Filter>
          <Filter.TypeSelector
            filterTypes={['Name', 'Topic', 'Message Only']}
            currentFilterType={currentFilterType}
            onFilterTypeSelected={next => {
              this.setState({
                currentFilterType: next,
                activeFilters
              });
            }}
          />
          {this.conditionalFilter(models)}
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
    );
  };

  render() {
    const allModels = this.props.discover
      .map(repo => repo.models)
      .concat([{ class_name: 'Report' }])
      .flat();
    const actors = this.props.discover.map(repo => repo.actors).flat();
    // eslint-disable-next-line prefer-const
    let lookup = Object.assign(
      {},
      ...allModels.map(m => ({ [m.class_name]: [] }))
    );
    actors.forEach(a => {
      a.produces.forEach(m => {
        lookup[m].push(a);
      });
      a.consumes.forEach(m => lookup[m].push(a));
    });
    const models = allModels.map(m =>
      Object.assign(m, { actors: lookup[m.class_name] })
    );

    return (
      <Grid fluid className="container-pf-nav-pf-vertical">
        {this.renderToolbar(models)}
        <ListView>{models.map(this.renderItem.bind(this))}</ListView>
      </Grid>
    );
  }
}

function ModelsPageWithContext() {
  return (
    <DiscoverContext.Consumer>
      {context => <ModelsPage discover={context} />}
    </DiscoverContext.Consumer>
  );
}

export default ModelsPageWithContext;

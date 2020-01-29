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

class WorkflowsPage extends Component {
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
    this.setState({ workflows: this.state.workflows });
  };

  closeExpand(item) {
    item.expanded = false;
    this.setState({ workflows: this.state.workflows });
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

  renderItem = actors => (item, index) => {
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
        heading={item.name}
        // description={item.description}
        stacked
        compoundExpand
        compoundExpanded={item.expanded}
        onCloseCompoundExpand={() => this.closeExpand(item)}
      >
        <Grid.Row>
          <Grid.Col sm={11}>
            <Grid style={{ width: '100%' }}>
              <Grid.Row>
                <strong>Phases:</strong>
              </Grid.Row>
              <Grid.Row>
                <Grid style={{ width: '100%' }}>
                  <Grid.Row>
                    <ListView>
                      {item.phases.map(phase => (
                        <ListView.Item
                          key={`${index}-${phase.class_name}`}
                          actions={renderActions()}
                          leftContent={<ListView.Icon name="microchip" />}
                          additionalInfo={[
                            <ListView.InfoItem key="details">
                              <ListView.Expand
                                expanded={
                                  phase.expanded &&
                                  phase.expandType === 'details'
                                }
                                toggleExpanded={() => {
                                  this.toggleExpand(phase, 'details');
                                }}
                              >
                                <span className="fa fa-info" />
                                <strong>Workflows</strong>
                              </ListView.Expand>
                            </ListView.InfoItem>
                          ]}
                          heading={phase.class_name}
                          // description={item.description}
                          compoundExpand
                          compoundExpanded={phase.expanded}
                          onCloseCompoundExpand={() => this.closeExpand(phase)}
                        >
                          <ul>
                            {actors
                              .filter(
                                actor =>
                                  actor.tags.indexOf(phase.filter.phase) !==
                                    -1 && actor.tags.indexOf(item.tag) !== -1
                              )
                              .map(actor => (
                                <li
                                  key={`workflows-phase-${phase.class_name}-${
                                    actor.class_name
                                  }`}
                                >
                                  {actor.class_name}
                                </li>
                              ))}
                          </ul>
                        </ListView.Item>
                      ))}
                    </ListView>
                  </Grid.Row>
                </Grid>
              </Grid.Row>
            </Grid>
          </Grid.Col>
        </Grid.Row>
      </ListView.Item>
    );
  };

  getOptions = workflows => {
    const { currentFilterType } = this.state;
    switch (currentFilterType) {
      case 'Name':
        return [...new Set(workflows.map(e => e.name).flat())].sort();
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

  conditionalFilter = workflows => {
    const { currentFilterType, currentFilterValue } = this.state;
    return (
      <TypeAheadSelect
        options={this.getOptions(workflows)}
        type={currentFilterType}
        allowNew
        clearButton
        selected={[currentFilterValue]}
        placeholder={currentFilterType}
        onChange={this.onTypeAheadChanged}
      />
    );
  };

  renderToolbar = workflows => {
    const { activeFilters, currentFilterType } = this.state;
    return (
      <Toolbar>
        <Filter>
          <Filter.TypeSelector
            filterTypes={['Name']}
            currentFilterType={currentFilterType}
            onFilterTypeSelected={next => {
              this.setState({
                currentFilterType: next,
                activeFilters
              });
            }}
          />
          {this.conditionalFilter(workflows)}
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
    const workflows = this.props.discover.map(repo => repo.workflows).flat();
    const actors = this.props.discover.map(repo => repo.actors).flat();
    return (
      <Grid fluid className="container-pf-nav-pf-vertical">
        {this.renderToolbar(workflows)}
        <ListView>{workflows.map(this.renderItem(actors).bind(this))}</ListView>
      </Grid>
    );
  }
}

function WorkflowsPageWithContext() {
  return (
    <DiscoverContext.Consumer>
      {context => <WorkflowsPage discover={context} />}
    </DiscoverContext.Consumer>
  );
}

export default WorkflowsPageWithContext;

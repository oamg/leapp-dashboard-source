import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DiscoverContext from '../DiscoverContext';

import {
  Button,
  Grid,
  ListView,
  Toolbar,
  Filter,
  TypeAheadSelect
} from 'patternfly-react';

// import { EmptyStateComponent } from '../components/EmptyStateComponent';

class TopicsPage extends Component {
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
    this.setState({ topics: this.state.topics });
  };

  closeExpand(item) {
    item.expanded = false;
    this.setState({ topics: this.state.topics });
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
                <strong>Models using {item.class_name}:</strong>
                <ul>
                  {item.messages.map(message => (
                    <li key={`message-topic-${message}-${item.class_name}`}>
                      {message}
                    </li>
                  ))}
                </ul>
              </Grid.Col>
            </Grid.Row>
          </Grid.Col>
        </Grid.Row>
      </ListView.Item>
    );
  };

  getOptions = topics => {
    const { currentFilterType } = this.state;
    switch (currentFilterType) {
      case 'Name':
        return [...new Set(topics.map(e => e.class_name).flat())].sort();
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

  conditionalFilter = topics => {
    const { currentFilterType, currentFilterValue } = this.state;
    return (
      <TypeAheadSelect
        options={this.getOptions(topics)}
        type={currentFilterType}
        allowNew
        clearButton
        selected={[currentFilterValue]}
        placeholder={currentFilterType}
        onChange={this.onTypeAheadChanged}
      />
    );
  };

  renderToolbar = topics => {
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
          {this.conditionalFilter(topics)}
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
    const topics = this.props.discover.map(repo => repo.topics).flat();
    return (
      <Grid fluid className="container-pf-nav-pf-vertical">
        {this.renderToolbar(topics)}
        <ListView>{topics.map(this.renderItem.bind(this))}</ListView>
      </Grid>
    );
  }
}

function TopicsPageWithContext() {
  return (
    <DiscoverContext.Consumer>
      {context => <TopicsPage discover={context} />}
    </DiscoverContext.Consumer>
  );
}

export default TopicsPageWithContext;

import PropTypes from "prop-types";
import React, { Component } from "react";
import { SearchDriver } from "@elastic/search-ui";

import SearchContext from "./SearchContext";

/**
 * The SearchProvider is the glue that connects the SearchDriver to
 * our React App.
 *
 * It "subscribes" to the SearchDriver in order to be notified of state
 * changes. It then syncs that state with its own state and passes that state
 * down to child components in a React Context. It will also pass down "Actions"
 * from the SearchDriver, which allow child components to update state.
 *
 * Any "Container" component placed within this context will have access
 * to the Driver's state and Actions.
 *
 */
class SearchProvider extends Component {
  static propTypes = {
    children: PropTypes.func.isRequired,

    config: PropTypes.shape({
      apiConnector: PropTypes.shape({
        click: PropTypes.func.isRequired,
        search: PropTypes.func.isRequired
      }).isRequired,
      conditionalFacets: PropTypes.objectOf(PropTypes.func),
      disjunctiveFacets: PropTypes.arrayOf(PropTypes.string),
      disjunctiveFacetsAnalyticsTags: PropTypes.arrayOf(PropTypes.string),
      facets: PropTypes.object,
      initialState: PropTypes.object,
      result_fields: PropTypes.objectOf(PropTypes.object),
      search_fields: PropTypes.objectOf(PropTypes.object),
      trackUrlState: PropTypes.bool
    })
  };

  subscription = state => {
    this.setState(state);
  };

  componentDidMount() {
    const { config } = this.props;
    this.driver = new SearchDriver(config);
    this.setState(this.driver.getState());
    this.driver.subscribeToStateChanges(this.subscription);
  }

  componentWillUnmount() {
    this.driver.tearDown();
  }

  render() {
    const { children } = this.props;
    if (!this.driver) return null;

    const providerValue = {
      ...this.state,
      ...this.driver.getActions()
    };

    return (
      <SearchContext.Provider value={providerValue}>
        {children(providerValue)}
      </SearchContext.Provider>
    );
  }
}

export default SearchProvider;

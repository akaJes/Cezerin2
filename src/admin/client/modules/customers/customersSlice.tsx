import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import api from "lib/api"
import { RootState } from "lib/store"

// Define a type for the slice state
interface CustomersState {
  editCustomer: null
  items: []
  selected: []
  hasMore: false
  totalCount: 0
  loadingItems: false
  errorLoadingItems: null
  search: ""
}

// Define the initial state using that type
const initialState: CustomersState = {
  editCustomer: null,
  items: [],
  selected: [],
  hasMore: false,
  totalCount: 0,
  loadingItems: false,
  errorLoadingItems: null,
  search: "",
}

export const customersSlice = createSlice({
  name: "customers",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
  },
})

export const {} = customersSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectCustomers = (state: RootState) => state.apps

export default customersSlice.reducer

const push = () => {}

function requestCustomer() {
  return {
    type: t.CUSTOMERS_DETAIL_REQUEST,
  }
}

function receiveCustomer(item) {
  return {
    type: t.CUSTOMERS_DETAIL_RECEIVE,
    item,
  }
}

export function clearCustomerDetails() {
  return receiveCustomer(null)
}

function requestCustomers() {
  return {
    type: t.CUSTOMERS_REQUEST,
  }
}

function requestMoreCustomers() {
  return {
    type: t.CUSTOMERS_MORE_REQUEST,
  }
}

function receiveCustomersMore({ has_more, total_count, data }) {
  return {
    type: t.CUSTOMERS_MORE_RECEIVE,
    has_more,
    total_count,
    data,
  }
}

function receiveCustomers({ has_more, total_count, data }) {
  return {
    type: t.CUSTOMERS_RECEIVE,
    has_more,
    total_count,
    data,
  }
}

function receiveCustomersError(error) {
  return {
    type: t.CUSTOMERS_FAILURE,
    error,
  }
}

export function selectCustomer(id) {
  return {
    type: t.CUSTOMERS_SELECT,
    customerId: id,
  }
}

export function deselectCustomer(id) {
  return {
    type: t.CUSTOMERS_DESELECT,
    customerId: id,
  }
}

export function deselectAllCustomer() {
  return {
    type: t.CUSTOMERS_DESELECT_ALL,
  }
}

export function selectAllCustomer() {
  return {
    type: t.CUSTOMERS_SELECT_ALL,
  }
}

export function setFilterSearch(value) {
  return {
    type: t.CUSTOMERS_FILTER_SET_SEARCH,
    search: value,
  }
}

function deleteCustomersSuccess() {
  return {
    type: t.CUSTOMER_DELETE_SUCCESS,
  }
}

function setGroupSuccess() {
  return {
    type: t.CUSTOMER_SET_GROUP_SUCCESS,
  }
}

const getFilter = (state, offset = 0) => {
  let filter = {
    limit: 50,
    offset: offset,
  }

  if (state.customers.search && state.customers.search !== "") {
    filter.search = state.customers.search
  }

  if (state.customerGroups.selectedId) {
    filter.group_id = state.customerGroups.selectedId
  }

  return filter
}

export function fetchCustomers() {
  return (dispatch, getState) => {
    const state = getState()
    if (!state.customers.loadingItems) {
      dispatch(requestCustomers())
      dispatch(deselectAllCustomer())

      let filter = getFilter(state)

      return api.customers
        .list(filter)
        .then(({ status, json }) => {
          dispatch(receiveCustomers(json))
        })
        .catch(error => {
          dispatch(receiveCustomersError(error))
        })
    }
  }
}

export function fetchMoreCustomers() {
  return (dispatch, getState) => {
    const state = getState()
    if (!state.customers.loadingItems) {
      dispatch(requestMoreCustomers())

      let filter = getFilter(state, state.customers.items.length)

      return api.customers
        .list(filter)
        .then(({ status, json }) => {
          dispatch(receiveCustomersMore(json))
        })
        .catch(error => {
          dispatch(receiveCustomersError(error))
        })
    }
  }
}

export function deleteCustomers() {
  return (dispatch, getState) => {
    const state = getState()
    let promises = state.customers.selected.map(customerId =>
      api.customers.delete(customerId)
    )

    return Promise.all(promises)
      .then(values => {
        dispatch(deleteCustomersSuccess())
        dispatch(deselectAllCustomer())
        dispatch(fetchCustomers())
      })
      .catch(error => {})
  }
}

export function deleteCurrentCustomer() {
  return (dispatch, getState) => {
    const state = getState()
    let customer = state.customers.editCustomer

    if (customer && customer.id) {
      return api.customers.delete(customer.id).catch(error => {
        console.log(error)
      })
    }
  }
}

export function setGroup(group_id) {
  return (dispatch, getState) => {
    const state = getState()
    let promises = state.customers.selected.map(customerId =>
      api.customers.update(customerId, { group_id: group_id })
    )

    return Promise.all(promises)
      .then(values => {
        dispatch(setGroupSuccess())
        dispatch(deselectAllCustomer())
        dispatch(fetchCustomers())
      })
      .catch(error => {})
  }
}

export function updateCustomer(data) {
  return (dispatch, getState) => {
    return api.customers
      .update(data.id, data)
      .then(customerResponse => {
        dispatch(receiveCustomer(customerResponse.json))
      })
      .catch(error => {})
  }
}

export function fetchCustomer(customerId) {
  return (dispatch, getState) => {
    dispatch(requestCustomer())

    return api.customers
      .retrieve(customerId)
      .then(customerResponse => {
        dispatch(receiveCustomer(customerResponse.json))
      })
      .catch(error => {})
  }
}

export function updateAddress(customerId, addressId, data) {
  return (dispatch, getState) => {
    return api.customers
      .updateAddress(customerId, addressId, data)
      .then(customerResponse => {
        dispatch(fetchCustomer(customerId))
      })
      .catch(error => {})
  }
}

export function deleteAddress(customerId, addressId) {
  return (dispatch, getState) => {
    return api.customers
      .deleteAddress(customerId, addressId)
      .then(customerResponse => {
        dispatch(fetchCustomer(customerId))
      })
      .catch(error => {})
  }
}

export function setDefaultBillingAddress(customerId, addressId) {
  return (dispatch, getState) => {
    return api.customers
      .setDefaultBillingAddress(customerId, addressId)
      .then(customerResponse => {
        dispatch(fetchCustomer(customerId))
      })
      .catch(error => {})
  }
}

export function setDefaultShippingAddress(customerId, addressId) {
  return (dispatch, getState) => {
    return api.customers
      .setDefaultShippingAddress(customerId, addressId)
      .then(customerResponse => {
        dispatch(fetchCustomer(customerId))
      })
      .catch(error => {})
  }
}

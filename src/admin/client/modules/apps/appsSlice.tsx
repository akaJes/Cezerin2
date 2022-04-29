import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import api from "lib/api"
import { RootState } from "lib/store"

// Define a type for the slice state
interface AppsState {
  account: null
  services: []
  service: null
  serviceSettings: null
  serviceLogs: null
  loadingEnableDisableService: false
}

// Define the initial state using that type
const initialState: AppsState = {
  account: null,
  services: [],
  service: null,
  serviceSettings: null,
  serviceLogs: null,
  loadingEnableDisableService: false,
}

export const appsSlice = createSlice({
  name: "apps",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
  },
})

export const {} = appsSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectApps = (state: RootState) => state.apps

export default appsSlice.reducer

const receiveAccount = account => ({
  type: t.ACCOUNT_RECEIVE,
  account,
})

const receiveServices = services => ({
  type: t.SERVICES_RECEIVE,
  services,
})

const receiveService = service => ({
  type: t.SERVICE_RECEIVE,
  service,
})

const requestEnableDisableService = () => ({
  type: t.SERVICE_ENABLE_REQUEST,
})

const receiveEnableDisableService = () => ({
  type: t.SERVICE_ENABLE_RECEIVE,
})

const requestServiceSettings = () => ({
  type: t.SERVICE_SETTINGS_REQUEST,
})

const receiveServiceSettings = serviceSettings => ({
  type: t.SERVICE_SETTINGS_RECEIVE,
  serviceSettings,
})

const receiveServiceLogs = serviceLogs => ({
  type: t.SERVICE_LOGS_RECEIVE,
  serviceLogs,
})

export const fetchAccount = () => (dispatch, getState) => {
  return api.webstore.account.retrieve().then(({ status, json }) => {
    dispatch(receiveAccount(json))
  })
}

export const updateAccount = account => (dispatch, getState) => {
  return api.webstore.account.update(account).then(({ status, json }) => {
    dispatch(receiveAccount(json))
  })
}

export const updateDeveloperAccount = account => (dispatch, getState) => {
  return api.webstore.account
    .updateDeveloper(account)
    .then(({ status, json }) => {
      dispatch(receiveAccount(json))
    })
}

export const fetchServices = () => (dispatch, getState) => {
  return api.webstore.services.list().then(({ status, json }) => {
    dispatch(receiveServices(json))
  })
}

export const fetchService = serviceId => (dispatch, getState) => {
  return api.webstore.services.retrieve(serviceId).then(({ status, json }) => {
    const service = json
    dispatch(receiveService(service))
    if (service.enabled) {
      dispatch(fetchServiceSettings(serviceId))
      dispatch(fetchServiceLogs(serviceId))
    }
  })
}

export const enableService = serviceId => (dispatch, getState) => {
  dispatch(requestEnableDisableService())
  return api.webstore.services.enable(serviceId).then(({ status, json }) => {
    dispatch(receiveEnableDisableService())
    dispatch(fetchService(serviceId))
  })
}

export const disableService = serviceId => (dispatch, getState) => {
  dispatch(requestEnableDisableService())
  return api.webstore.services.disable(serviceId).then(({ status, json }) => {
    dispatch(receiveEnableDisableService())
    dispatch(fetchService(serviceId))
  })
}

export const fetchServiceSettings = serviceId => (dispatch, getState) => {
  dispatch(requestServiceSettings())
  return api.webstore.services.settings
    .retrieve(serviceId)
    .then(({ status, json }) => {
      const serviceSettings = json
      dispatch(receiveServiceSettings(serviceSettings))
    })
    .catch(error => {})
}

export const updateServiceSettings =
  (serviceId, settings) => (dispatch, getState) => {
    return api.webstore.services.settings
      .update(serviceId, settings)
      .then(({ status, json }) => {
        dispatch(fetchServiceSettings(serviceId))
      })
      .catch(error => {})
  }

export const fetchServiceLogs = serviceId => (dispatch, getState) => {
  return api.webstore.services.logs
    .list(serviceId)
    .then(({ status, json }) => {
      dispatch(receiveServiceLogs(json))
    })
    .catch(error => {})
}

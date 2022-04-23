const state = {
    dataType : "normal",
}
const getters = {
}
const mutations = {
    setDataType(state, appendData) {           
        state.dataType = appendData;            
    }
}
const actions = {
}
export default{
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
export function getToken(){
  if(localStorage.getItem("token")){
    return true
  }
  return false
}
import axios from "axios";

async function axiosRequest(type: string, url: string, postData?: {}, headers?: {}) {
    
    let data: any;
    if(type == 'GET') {
        try {
            const response = await axios.get(url, headers)
            data = response;
        } catch (error) {
            throw new Error(error.response.data.message);
        }
    }
    if(type == 'POST') {
        try {
            const response = await axios.post(url, postData, headers)
            data = response;
        } catch (error) {
            data = error.response;
        }
        
    }
    return data;
}

const emailRegex = (email: string) => {
    if(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)){
        return true;
    }
    return false;
}

const chatKey = (myuid: string, contactUid: string) => {
    if(myuid < contactUid){
        return myuid+contactUid;  
      }
    else{
        return contactUid+myuid;
    }
}
export {
    axiosRequest,
    emailRegex,
    chatKey
}
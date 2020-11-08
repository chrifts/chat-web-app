import * as firebase from "firebase";
import axios from "axios";
import "firebase/database";

async function axiosRequest(type: string, url: string, postData?: {}) {
    const tokenId = await firebase.auth().currentUser!.getIdToken(/* forceRefresh */ true);
    const axiosHeader = {
        headers: {
          authorization: 'Bearer '+tokenId
        }
      }
    let data: any;
    if(type == 'GET') {
        try {
            const response = await axios.get(url, axiosHeader)
            data = response;
        } catch (error) {
            throw new Error(error.response.data.message);
        }
    }
    if(type == 'POST') {
        try {
            const response = await axios.post(url, postData, axiosHeader)
            data = response;
        } catch (error) {
            throw new Error(error.response.data.message);
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
export {
    axiosRequest,
    emailRegex
}
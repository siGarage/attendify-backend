const success = (message,data) => ({
    status_code: 1,
    status_text:'success',
    message:message,
    data:data

})

 const failed = (message) => ({
       status_code: 0,
       status_text: 'failed',
       message:message

 });


 export default {success,failed}
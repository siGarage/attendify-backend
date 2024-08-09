const success = (message,data) => ({
    status_text:'success',
    message:message,
    data:data

})

 const failed = (message) => ({
       status_text: 'failed',
       message:message
 });


 export default {success,failed}
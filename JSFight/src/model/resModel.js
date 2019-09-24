// class BaseModel {
//     constructor(data, msg) {
//       if (typeof data === "string") {
//         this.msg = data;
//         data = null;
//         msg = null;
//       }
//       if (data) this.data = data;
//       if (msg) this.msg = msg;
//     }
//   }
  
//   class SuccessModel extends BaseModel {
//     constructor(data, msg) {
//       super(data, msg);
//       this.errno = 0;
//     }
//   }
  
//   class ErrorModel extends BaseModel {
//     constructor(data, msg) {
//       super(data, msg);
//       this.errno = -1;
//     }
//   }

  class BaseModel {
    constructor(obj){
      this.code = obj.code;
      this.msg = obj.msg;
    }
  }

  class SuccessModel extends BaseModel{
    constructor(data, obj) {
      super(obj);
      this.data = data;
    }
  }
  
  class ErrorModel extends BaseModel{
    constructor(error, obj) {
      super(obj);
      this.error = error;
    }
  }


  // class ReturnModel{
  //   constructor(data, obj){
  //     this.data = data;
  //     this.code = obj.defined_code;
  //     this.msg = obj.msg;
  //   }
  // }
  
  module.exports = {
    SuccessModel,
    ErrorModel
  }
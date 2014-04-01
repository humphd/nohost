define(function() {

  return {
    error: function(msg) {
      console.error('[nohost error]: ' + msg);
    },
    info: function(msg) {
      console.info('[nohost]: ' + msg);
    }
  };

});
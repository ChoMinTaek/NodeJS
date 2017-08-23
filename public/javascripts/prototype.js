Date.prototype.convertTo = function() {
  function padZero(obj) {
    obj = obj + '';
    if (obj.length == 1) obj = '0' + obj;
    return obj;
  }
  var output = '';
  output += this.getFullYear();
  output += padZero(this.getMonth() + 1);
  output += padZero(this.getDate());
  output += padZero(this.getHours());
  output += padZero(this.getMinutes());
  output += padZero(this.getSeconds());

  mode = String(arguments[0]).toUpperCase();
  if (mode == 'YYYYMMDD') output = String(output).replace(/(\d{4})(\d{2})(\d{2})/g, '$1$2$3');
  else if (mode == 'YYYY-MM-DD') output = String(output).replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
  else if (mode == "YYYYMMDDHHMISS") output = String(output).replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1$2$3$4$5$6');
  else if (mode == "YYYY-MM-DD HH:MI:SS") output = String(output).replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
  else if (mode == "HHMISS") output = String(output).replace(/(\d{2})(\d{2})(\d{2})/g, '$4$5$6');
  return output;
}

String.prototype.format = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};